//! Vanguard UK product pages (server-rendered): the country table (largest
//! countries), the top-10 holdings, number of stocks and the OCF.

use super::{Error, FundDetails, Holding, complete, countries, html, parse, top};
use std::collections::BTreeMap;

pub async fn fetch(http: &reqwest::Client, url: &str) -> Result<FundDetails, Error> {
    let response = http.get(url).send().await?;
    match response.status() {
        s if s == reqwest::StatusCode::TOO_MANY_REQUESTS => return Err(Error::RateLimited),
        s if s == reqwest::StatusCode::NOT_FOUND => return Err(Error::NotFound),
        s if !s.is_success() => return Err(Error::Status(s)),
        _ => {}
    }
    parse(&response.text().await?)
}

pub fn parse(page: &str) -> Result<FundDetails, Error> {
    let mut details = FundDetails::default();
    let tables = html::tables(page);
    let starts_with = |label: &str| {
        tables
            .iter()
            .find(|t| t.first().and_then(|h| h.first()).is_some_and(|c| c == label))
    };

    if let Some(table) = starts_with("Country") {
        let mut by_country: BTreeMap<&'static str, f64> = BTreeMap::new();
        // Country | Region | Fund | Benchmark | Variance
        for row in table.iter().skip(1) {
            let (Some(name), Some(weight)) = (row.first(), row.get(2).and_then(|w| parse::percent(w)))
            else {
                continue;
            };
            *by_country.entry(countries::code(name).unwrap_or("ZZ")).or_default() += weight;
        }
        details.countries = complete(by_country);
    }

    if let Some(table) = starts_with("Holding name") {
        // Holding name | % of market value | Sector | Region | Market value | Shares
        let holdings = table
            .iter()
            .skip(1)
            .filter_map(|row| {
                Some(Holding {
                    name: row.first()?.clone(),
                    ticker: None,
                    weight: parse::percent(row.get(1)?)?,
                    sector: row.get(2).filter(|s| !s.is_empty()).cloned(),
                    country: row.get(3).and_then(|c| countries::code(c)),
                })
            })
            .collect::<Vec<_>>();
        details.holdings = top(holdings);
    }

    if let Some(table) = starts_with("Fundamentals") {
        // Fundamentals | Fund | Benchmark | As at
        if let Some(row) = table.iter().find(|r| r.first().is_some_and(|c| c == "Number of stocks")) {
            details.holdings_count = row.get(1).and_then(|n| parse::number(n)).map(|n| n as i32);
            details.as_of = row.get(3).and_then(|d| parse::date(d));
        }
    }

    // <div data-search-id="ocf" class="h-xxl"> 0.14% <!----></div>
    if let Some(i) = page.find("data-search-id=\"ocf\"") {
        let rest = &page[i..];
        if let Some(start) = rest.find('>') {
            let value = &rest[start + 1..];
            let end = value.find('<').unwrap_or(value.len());
            details.ter = parse::percent(&value[..end]);
        }
    }

    if details.countries.is_empty() && details.holdings.is_empty() {
        return Err(Error::Format("no country or holdings table on the page".into()));
    }
    Ok(details)
}

#[cfg(test)]
mod tests {
    use super::*;
    use time::macros::date;

    const PAGE: &str = r#"
<div data-search-id="ocf" class="h-xxl"> 0.14% <!----></div>
<table><thead><tr><th>Fundamentals</th><th>Fund</th><th>Benchmark</th><th>As at</th></tr></thead>
<tbody><tr><th>Number of stocks</th><td>3,574</td><td>4,199</td><td>31 Oct 2026</td></tr></tbody></table>
<table><thead><tr><th>Country</th><th>Region</th><th>Fund</th><th>Benchmark</th><th>Variance +/-</th></tr></thead>
<tbody><tr><th scope="row">United States of America</th><td>North America</td><td class="numeric"> 62.83% </td><td>62.71%</td><td>0.12%</td></tr>
<tr><th>Japan</th><td>Pacific</td><td> 5.94% </td><td>5.93%</td><td>0.01%</td></tr></tbody></table>
<table><thead><tr><th>Holding name</th><th>% of market value</th><th>Sector</th><th>Region</th><th>Market value</th><th>Shares</th></tr></thead>
<tbody><tr><th>Apple Inc</th><td> 4.74363% </td><td> Technology </td><td>US</td><td>US$4,239,627,231.84</td><td>12,301,968</td></tr></tbody></table>"#;

    #[test]
    fn parses_page() {
        let d = parse(PAGE).unwrap();
        assert!((d.ter.unwrap() - 0.0014).abs() < 1e-12);
        assert_eq!(d.holdings_count, Some(3574));
        assert_eq!(d.as_of, Some(date!(2026 - 10 - 31)));
        assert!((d.countries["US"] - 0.6283).abs() < 1e-9);
        assert!((d.countries["ZZ"] - (1.0 - 0.6283 - 0.0594)).abs() < 1e-9);
        assert_eq!(d.holdings[0].name, "Apple Inc");
        assert_eq!(d.holdings[0].country, Some("US"));
        assert_eq!(d.holdings[0].sector.as_deref(), Some("Technology"));
    }
}
