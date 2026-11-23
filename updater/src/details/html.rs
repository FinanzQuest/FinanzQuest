//! Just enough HTML to read the tables of a server-rendered page.

/// Every `<table>` as rows of cell texts (`<th>` and `<td>`, tags removed,
/// entities decoded, whitespace collapsed).
pub fn tables(html: &str) -> Vec<Vec<Vec<String>>> {
    let mut out = Vec::new();
    let mut rest = html;
    while let Some(start) = find_tag(rest, "table") {
        let after = &rest[start..];
        let end = after
            .find("</table>")
            .map_or(after.len(), |e| e + "</table>".len());
        let table = &after[..end];
        let mut rows = Vec::new();
        let mut r = table;
        while let Some(tr) = find_tag(r, "tr") {
            let row_html = &r[tr..];
            let row_end = row_html.find("</tr>").map_or(row_html.len(), |e| e + 5);
            rows.push(cells(&row_html[..row_end]));
            r = &row_html[row_end..];
        }
        out.push(rows);
        rest = &after[end..];
    }
    out
}

/// Position of the next `<name` tag (not `<name-something`).
fn find_tag(s: &str, name: &str) -> Option<usize> {
    let open = format!("<{name}");
    let mut from = 0;
    while let Some(i) = s[from..].find(&open) {
        let at = from + i;
        match s.as_bytes().get(at + open.len()) {
            Some(b'>' | b' ' | b'\n' | b'\t' | b'\r') => return Some(at),
            _ => from = at + open.len(),
        }
    }
    None
}

fn cells(row: &str) -> Vec<String> {
    let mut out = Vec::new();
    let mut rest = row;
    loop {
        let th = find_tag(rest, "th");
        let td = find_tag(rest, "td");
        let (start, close) = match (th, td) {
            (Some(a), Some(b)) if a < b => (a, "</th>"),
            (Some(a), None) => (a, "</th>"),
            (_, Some(b)) => (b, "</td>"),
            (None, None) => break,
        };
        let cell = &rest[start..];
        let Some(content_start) = cell.find('>') else {
            break;
        };
        let end = cell.find(close).unwrap_or(cell.len());
        out.push(text(&cell[content_start + 1..end.max(content_start + 1)]));
        rest = &cell[end.min(cell.len())..];
    }
    out
}

/// Tags removed, entities decoded, whitespace collapsed.
pub fn text(fragment: &str) -> String {
    let mut plain = String::with_capacity(fragment.len());
    let mut in_tag = false;
    for c in fragment.chars() {
        match c {
            '<' => in_tag = true,
            '>' => {
                in_tag = false;
                plain.push(' ');
            }
            _ if !in_tag => plain.push(c),
            _ => {}
        }
    }
    let decoded = plain
        .replace("&nbsp;", " ")
        .replace("&amp;", "&")
        .replace("&#39;", "'")
        .replace("&#x27;", "'")
        .replace("&quot;", "\"")
        .replace("&lt;", "<")
        .replace("&gt;", ">");
    decoded.split_whitespace().collect::<Vec<_>>().join(" ")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_cells() {
        let html = r#"<div><table class="x"><thead><tr _ngcontent-a=""><th scope="col">Country</th><th>Fund</th></tr></thead>
            <tbody><tr><th scope="row">United States of America</th><td class="numeric"> 62.83% </td></tr>
            <tr><th>Procter &amp; Gamble</th><td><span>1.0%</span></td></tr></tbody></table><table-like></table-like></div>"#;
        let t = tables(html);
        assert_eq!(t.len(), 1);
        assert_eq!(t[0][0], vec!["Country", "Fund"]);
        assert_eq!(t[0][1], vec!["United States of America", "62.83%"]);
        assert_eq!(t[0][2], vec!["Procter & Gamble", "1.0%"]);
    }
}
