//! Number and date formats of the providers' files and pages.

/// "8,368,157,077.76", "8’368’157’077.76", "4.74363%", "US$4,239.84",
/// "187.3  B" -> f64. `None` for "-", "", "—".
pub fn number(s: &str) -> Option<f64> {
    let cleaned: String = s
        .chars()
        .filter(|c| c.is_ascii_digit() || matches!(c, '.' | '-' | 'e' | 'E'))
        .collect();
    if cleaned.is_empty() || cleaned == "-" {
        return None;
    }
    cleaned.parse().ok()
}

/// A percentage as a fraction: "4.74363%" -> 0.0474363.
pub fn percent(s: &str) -> Option<f64> {
    number(s).map(|v| v / 100.0)
}

fn month(name: &str) -> Option<time::Month> {
    use time::Month::*;
    let m = match name.get(..3)?.to_ascii_lowercase().as_str() {
        "jan" => January,
        "feb" => February,
        "mar" => March,
        "apr" => April,
        "may" => May,
        "jun" => June,
        "jul" => July,
        "aug" => August,
        "sep" => September,
        "oct" => October,
        "nov" => November,
        "dec" => December,
        _ => return None,
    };
    Some(m)
}

/// "20/Nov/2026", "Nov 20, 2026", "31 Oct 2026", "30 Sept 2026",
/// "2019-07-23" -> Date.
pub fn date(s: &str) -> Option<time::Date> {
    let s = s.trim().trim_matches('"');
    if let Ok(d) = time::Date::parse(s, time::macros::format_description!("[year]-[month]-[day]")) {
        return Some(d);
    }
    let parts: Vec<&str> = s
        .split(|c: char| c == '/' || c == ',' || c.is_whitespace())
        .filter(|p| !p.is_empty())
        .collect();
    let [a, b, c] = parts.as_slice() else {
        return None;
    };
    let (day, mon) = match (a.parse::<u8>(), b.parse::<u8>()) {
        (Ok(day), _) => (day, month(b)?),
        (_, Ok(day)) => (day, month(a)?),
        _ => return None,
    };
    time::Date::from_calendar_date(c.parse().ok()?, mon, day).ok()
}

#[cfg(test)]
mod tests {
    use super::*;
    use time::macros::date as d;

    #[test]
    fn numbers() {
        assert_eq!(number("8,368,157,077.76"), Some(8_368_157_077.76));
        assert_eq!(number("8’368’157.5"), Some(8_368_157.5));
        assert!((percent(" 4.74363% ").unwrap() - 0.0474363).abs() < 1e-12);
        assert_eq!(number("US$4,239.84"), Some(4239.84));
        assert_eq!(number("-"), None);
        assert_eq!(number("—"), None);
    }

    #[test]
    fn dates() {
        assert_eq!(date("20/Nov/2026"), Some(d!(2026 - 11 - 20)));
        assert_eq!(date("\"Nov 20, 2026\""), Some(d!(2026 - 11 - 20)));
        assert_eq!(date("31 Oct 2026"), Some(d!(2026 - 10 - 31)));
        assert_eq!(date("30 Sept 2026"), Some(d!(2026 - 09 - 30)));
        assert_eq!(date("2019-07-23"), Some(d!(2019 - 07 - 23)));
        assert_eq!(date("soon"), None);
    }
}
