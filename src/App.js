import React, { useState, useEffect } from "react";
import "./App.css";
import Infobox from "./Infobox";
import Table from "./Table";
import Map from "./Map";
import LineGraph from "./LineGraph";
import { sortData, prettyPrintStat } from "./util";
import "leaflet/dist/leaflet.css";
import {
	MenuItem,
	FormControl,
	Select,
	Card,
	CardContent,
} from "@material-ui/core";
//https://disease.sh/v3/covid-19/countries
function App() {
	const [countries, setCountries] = useState([]);
	const [country, setCountry] = useState("worldwide");
	const [countryInfo, setCountryInfo] = useState({});
	const [tableData, setTableData] = useState([]);
	const [casesType, setCasesType] = useState("cases");
	const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
	const [mapZoom, setMapZoom] = useState(3);
	const [mapCountries, setMapCountries] = useState([]);
	//STATE = how to write a variable in react
	useEffect(() => {
		fetch("https://disease.sh/v3/covid-19/all")
			.then((response) => response.json())
			.then((data) => {
				setCountryInfo(data);
			});
	}, []);

	useEffect(() => {
		const getCountriesData = async () => {
			await fetch("https://disease.sh/v3/covid-19/countries")
				.then((response) => response.json())
				.then((data) => {
					const countries = data.map((country) => ({
						name: country.country, //United states..
						value: country.countryInfo.iso2, // USA,Uk...
					}));
					const sortedData = sortData(data);
					setTableData(sortedData);
					setMapCountries(data);
					setCountries(countries);
				});
		};
		getCountriesData();
	}, [countries]);

	const onCountryChange = async (event) => {
		const countryCode = event.target.value;
		console.log("Yoooo >>>>>>>", countryCode);
		setCountry(countryCode);

		const url =
			countryCode === "worldwide"
				? "https://disease.sh/v3/covid-19/all"
				: `https://disease.sh/v3/covid-19/countries/${countryCode}`;
		await fetch(url)
			.then((response) => response.json())
			.then((data) => {
				setCountry(countryCode);
				setCountryInfo(data); //all of the data from countries response

				setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
				setMapZoom(4);
			});
	};

	return (
		<div className="app">
			<div className="app__left">
				<div className="app__header">
					<h1>COVID-19 TRACKER</h1>
					<FormControl className="app__dropdown">
						<Select
							variant="outlined"
							onChange={onCountryChange}
							value={country}
						>
							<MenuItem value="worldwide">Worldwide</MenuItem>
							{countries.map((country) => (
								<MenuItem value={country.value}>{country.name}</MenuItem>
							))}
						</Select>
					</FormControl>
				</div>
				<div className="app__stats">
					<Infobox
						isRed
						active={casesType === "cases"}
						onClick={(e) => setCasesType("cases")}
						title=" Today Coronavirus Cases"
						cases={prettyPrintStat(countryInfo.todayCases)}
						total={prettyPrintStat(countryInfo.cases)}
					/>
					<Infobox
						active={casesType === "recovered"}
						onClick={(e) => setCasesType("recovered")}
						title=" Today Recovered"
						cases={prettyPrintStat(countryInfo.todayRecovered)}
						total={prettyPrintStat(countryInfo.recovered)}
					/>
					<Infobox
						isRed
						active={casesType === "deaths"}
						onClick={(e) => setCasesType("deaths")}
						title="Today Deaths"
						cases={prettyPrintStat(countryInfo.todayDeaths)}
						total={prettyPrintStat(countryInfo.deaths)}
					/>
				</div>
				<Map
					casesType={casesType}
					countries={mapCountries}
					center={mapCenter}
					zoom={mapZoom}
				/>
			</div>
			<Card className="app__right">
				<CardContent>
					<h3>Live cases by country</h3>
					<Table countries={tableData} />
					<h3 className="app__graphTitle">Worldwide new {casesType}</h3>
					<LineGraph className="app__graph" casesType={casesType} />
				</CardContent>
			</Card>
		</div>
	);
}

export default App;
