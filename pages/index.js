import Head from "next/head";
import Image from "next/image";
import MainPage from "../components/MainPage";
import Modal from "../components/Modal";

export default function Home() {
	return (
		<div>
			<Head>
				<title>Timetabler</title>
				<meta name="description" content="Generated by create next app" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<MainPage />

			<footer style={{ marginTop: "50px" }}>
				<div className="container text-center">
					<hr></hr>
					<p>
						Made by{" "}
						<a href="https://www.edwinroosevelt.com" target="_blank" rel="noreferrer">
							Edwin Roosevelt
						</a>
					</p>
				</div>
			</footer>
		</div>
	);
}
