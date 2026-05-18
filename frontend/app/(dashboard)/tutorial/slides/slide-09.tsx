"use client"

import { currencyFormat } from "@/lib/cash_display_string"
import {
	SlideLayout,
	SlideHeader,
	SlideSection,
	InfoCard,
	DataTable,
} from "./slide-layout"
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts"

function calcGrowthWithTER(
	start: number,
	grossReturn: number,
	ter: number,
	years: number
) {
	const netRate = (grossReturn - ter) / 100
	return Array.from({ length: years + 1 }, (_, i) => ({
		year: i,
		value: Math.round(start * Math.pow(1 + netRate, i)),
	}))
}

const etfData = calcGrowthWithTER(10000, 7, 0.2, 30)
const activeFundData = calcGrowthWithTER(10000, 7, 1.5, 30)

const chartData = etfData.map((d, i) => ({
	year: d.year,
	ETF: d.value,
	AktiverFonds: activeFundData[i].value,
}))

function formatEur(v: number) {
	return currencyFormat.format(v)
}

export function Slide09() {
	const etfEnd = etfData[etfData.length - 1].value
	const fundEnd = activeFundData[activeFundData.length - 1].value

	return (
		<SlideLayout>
			<SlideHeader
				eyebrow="ETFs"
				title="ETFs genauer betrachtet"
				subtitle="ETFs kombinieren breite Risikostreuung mit sehr geringen Kosten – und genau das macht über Jahrzehnte einen enormen Unterschied."
			/>

			<SlideSection>
				<h2 className="text-foreground font-semibold text-lg">
					Was ist die TER?
				</h2>
				<p className="text-foreground/75 text-sm leading-relaxed">
					Die{" "}
					<span className="text-foreground font-medium">
						TER (Total Expense Ratio)
					</span>{" "}
					ist die jährliche Gebühr, die ein Fonds für seine Verwaltung erhebt.
					Sie wird automatisch vom Fondsvermögen abgezogen – du siehst sie nicht
					als separate Zahlung, aber sie schmälert deine Rendite jedes Jahr.
				</p>
				<p className="text-foreground/75 text-sm leading-relaxed">
					Warum ist eine hohe TER so problematisch? Weil sie jedes Jahr anfällt
					und damit durch den Zinseszinseffekt über lange Zeiträume{" "}
					<span className="text-foreground font-medium">
						enorme Auswirkungen
					</span>{" "}
					hat.
				</p>
			</SlideSection>

			<div className="rounded-xl border bg-muted/40 p-6 flex flex-col gap-4">
				<div className="grid grid-cols-2 gap-4">
					<div className="rounded-lg border bg-muted/60 p-4 flex flex-col gap-1">
						<span className="text-xs text-muted-foreground">
							ETF (TER 0,2 %)
						</span>
						<span className="text-2xl font-bold text-emerald-500">
							{etfEnd.toLocaleString("de-DE")} €
						</span>
					</div>
					<div className="rounded-lg border bg-muted/60 p-4 flex flex-col gap-1">
						<span className="text-xs text-muted-foreground">
							Aktiver Fonds (TER 1,5 %)
						</span>
						<span className="text-2xl font-bold text-foreground/60">
							{fundEnd.toLocaleString("de-DE")} €
						</span>
					</div>
				</div>
				<ResponsiveContainer width="100%" height={180}>
					<AreaChart
						data={chartData}
						margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
					>
						<defs>
							<linearGradient id="etfGrad" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
								<stop offset="95%" stopColor="#10b981" stopOpacity={0} />
							</linearGradient>
							<linearGradient id="fundGrad" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#71717a" stopOpacity={0.2} />
								<stop offset="95%" stopColor="#71717a" stopOpacity={0} />
							</linearGradient>
						</defs>
						<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
						<XAxis
							dataKey="year"
							tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
							tickLine={false}
							label={{
								value: "Jahre",
								position: "insideBottomRight",
								fill: "hsl(var(--muted-foreground))",
								fontSize: 11,
								offset: -5,
							}}
						/>
						<YAxis
							tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
							tickLine={false}
							tickFormatter={formatEur}
							width={50}
						/>
						<Tooltip
							contentStyle={{
								background: "hsl(var(--card))",
								border: "1px solid hsl(var(--border))",
								borderRadius: 8,
								fontSize: 12,
								color: "hsl(var(--foreground))",
							}}
							labelFormatter={v => `Jahr ${v}`}
							formatter={(v: number, name: string) => [
								`${v.toLocaleString("de-DE")} €`,
								name === "ETF"
									? "ETF (0,2 % TER)"
									: "Aktiver Fonds (1,5 % TER)",
							]}
						/>
						<Legend
							formatter={v =>
								v === "ETF" ? "ETF (0,2 % TER)" : "Aktiver Fonds (1,5 % TER)"
							}
							wrapperStyle={{
								fontSize: 12,
								color: "hsl(var(--muted-foreground))",
							}}
						/>
						<Area
							type="monotone"
							dataKey="AktiverFonds"
							stroke="hsl(var(--muted-foreground))"
							strokeWidth={2}
							fill="url(#fundGrad)"
							strokeDasharray="5 5"
						/>
						<Area
							type="monotone"
							dataKey="ETF"
							stroke="#10b981"
							strokeWidth={2.5}
							fill="url(#etfGrad)"
						/>
					</AreaChart>
				</ResponsiveContainer>
				<p className="text-muted-foreground text-xs">
					Gleiche Rendite vor Kosten (7 %), Startkapital 10.000 €, Laufzeit 30
					Jahre. Differenz:{" "}
					<span className="text-foreground font-medium">
						{(etfEnd - fundEnd).toLocaleString("de-DE")} €
					</span>{" "}
					– allein durch den Kostenunterschied.
				</p>
			</div>

			<SlideSection>
				<h2 className="text-foreground font-semibold text-lg">
					Weitere wichtige ETF-Begriffe
				</h2>
				<DataTable
					headers={["Begriff", "Bedeutung"]}
					rows={[
						[
							"Thesaurierend",
							"Erträge werden automatisch reinvestiert → Zinseszinseffekt ohne Zutun",
						],
						[
							"Ausschüttend",
							"Erträge werden regelmäßig ausgezahlt – müssen selbst reinvestiert werden",
						],
						[
							"MSCI World",
							"Index aus ca. 1.400 Unternehmen aus 23 Industrieländern",
						],
						["S&P 500", "Index der 500 größten börsennotierten US-Unternehmen"],
					]}
				/>
			</SlideSection>
		</SlideLayout>
	)
}
