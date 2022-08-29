import React, { useEffect, useState, useRef } from "react";
import { generateTimeTable } from "../logic";
// import styles from "./MainPage.module.css";

// import { ButtonGroup, Button, TextField } from "@mui/material";
import { CONSTRAINDATA, GENERALINFO, TEACHERSDATA } from "../logic/data";
import Modal from "./Modal";

const WEEEKDAYS = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];

const EMPTYCLASSSUB = () => {
	return {
		id: Math.random().toString(16).slice(8),
		subjectName: "",
		classId: "",
	};
};

const EMPTYTEACHER = () => {
	return {
		id: Math.random().toString(16).slice(8),
		name: "",
		classSub: [EMPTYCLASSSUB()],
	};
};

const DEFAULTCONSTRAIN = (recentSetting) => {
	const newConstrain = {
		slots: { days: [1, 2, 3, 4, 5], sessions: [1, 2, 3] },
		frequencyPer: { week: 5, space: "EVENLY" },
		_meta: { showDetails: false },
	};
	if (recentSetting) {
		newConstrain.frequencyPer = JSON.parse(
			JSON.stringify(recentSetting.frequencyPer)
		);
		newConstrain.slots = JSON.parse(JSON.stringify(recentSetting.slots));
	}
	console.log(newConstrain);
	return newConstrain;
};

function MainPage() {
	const [table, setTable] = useState(null);
	const [teachersData, setTeachersData] = useState(TEACHERSDATA);
	const [constrainData, setConstrainData] = useState(CONSTRAINDATA);
	const [generalData, setGeneralData] = useState(GENERALINFO);
	const [recentSetting, setRecentSetting] = useState({
		slots: { days: [1, 2, 3, 4, 5], sessions: [1, 2, 3] },
		frequencyPer: { week: 5, space: "EVENLY" },
	});

	useEffect(() => {
		// const savedData = JSON.parse(
		// 	sessionStorage.getItem("timetabler_saved_session")
		// );
		// if (savedData) {
		// 	setTeachersData(savedData.teachersData);
		// 	setConstrainData(savedData.constrainData);
		// 	setGeneralData(savedData.generalData);
		// 	setRecentSetting(savedData.recentSetting);
		// }
		addEventListener("beforeunload", beforeUnloadListener);
		return () => {
			removeEventListener("beforeunload", beforeUnloadListener);
		};
	}, []);

	const beforeUnloadListener = (event) => {
		event.preventDefault();
		return (event.returnValue = "Are you sure you want to exit?");
	};

	// Avoiding update on the first render
	// const firstRender = useRef(true);
	// useEffect(() => {
	// 	if (firstRender.current) {
	// 		firstRender.current = false;
	// 		return;
	// 	}
	// 	sessionStorage.setItem(
	// 		"timetabler_saved_session",
	// 		JSON.stringify({ teachersData, constrainData, generalData, recentSetting })
	// 	);
	// }, [teachersData, constrainData, generalData, recentSetting]);

	const changeGeneralInfo = (event) => {
		setGeneralData((generalData) => {
			const newGeneralData = { ...generalData };
			newGeneralData[event.target.id] = event.target.value;
			return newGeneralData;
		});
		console.log(event.target.value);
	};

	const addTeacher = () => {
		const newTeachersData = [...teachersData];
		newTeachersData.push(EMPTYTEACHER());
		setTeachersData(newTeachersData);
	};

	const delTeacher = (idToBeDel) => {
		teachersData.map((teacher) => {
			if (teacher.id === idToBeDel) {
				teacher.classSub.map((classSub) => {
					updateConstrainData(classSub.id, "DEL");
				});
			}
		});
		const newTeachersData = teachersData.filter(
			(teacher) => teacher.id !== idToBeDel
		);
		setTeachersData(newTeachersData);
	};

	const changeTeacherName = (event) => {
		const newTeachersData = teachersData.map((teacher) => {
			if (teacher.id === event.target.id) teacher.name = event.target.value;
			return teacher;
		});
		setTeachersData(newTeachersData);
	};

	const addClassSub = (event) => {
		const newTeachersData = teachersData.map((teacher) => {
			if (teacher.id === event.target.id) {
				const newClassSub = [...teacher.classSub];
				newClassSub.push(EMPTYCLASSSUB());
				teacher.classSub = newClassSub;
			}
			return teacher;
		});
		setTeachersData(newTeachersData);
	};

	const deleteClassSub = (event) => {
		const teacherToBeDel = event.target.id.split(",")[0];
		const classSubToBeDel = event.target.id.split(",")[1];

		const newTeachersData = teachersData.map((teacher) => {
			if (teacher.id === teacherToBeDel) {
				const newClassSub = teacher.classSub.filter(
					(classSub) => classSub.id !== classSubToBeDel
				);
				teacher.classSub = newClassSub;
				updateConstrainData(classSubToBeDel, "DEL");
			}
			return teacher;
		});
		setTeachersData(newTeachersData);
	};

	const changeClassSub = (event) => {
		const teacherId = event.target.id.split(",")[0];
		const classSubId = event.target.id.split(",")[1];
		const type = event.target.id.split(",")[2];

		const newTeachersData = teachersData.map((teacher) => {
			if (teacher.id === teacherId) {
				const newClassSub = teacher.classSub.map((classSub) => {
					if (classSub.id === classSubId) {
						classSub[type] = event.target.value;
						updateConstrainData(classSub, "UPDATE");
					}
					return classSub;
				});
				teacher.classSub = newClassSub;
			}
			return teacher;
		});
		setTeachersData(newTeachersData);
	};

	const changeConstrainData = (event) => {
		const field1 = event.target.getAttribute("data-field1");
		const field2 = event.target.getAttribute("data-field2");

		// console.log(event.nativeEvent.inputType === "deleteContentBackward");
		// console.log(event.target.value);

		const newConstrainData = constrainData.map((classSub) => {
			if (classSub.id === event.target.id) {
				if (field2 === "days" || field2 === "sessions") {
					// Poping last value
					if (event.nativeEvent.inputType === "deleteContentBackward") {
						classSub[field1][field2].pop();
						setRecentSetting({
							slots: classSub.slots,
							frequencyPer: classSub.frequencyPer,
						});
						return classSub;
					}
					const newValue = parseInt(event.target.value.at(-1));

					// ignoring Not_A_Number
					if (isNaN(newValue)) return classSub;

					// ignoring values > upperlimit
					if (field2 === "days" && newValue > generalData.totalDays) return classSub;
					if (field2 === "sessions" && newValue > generalData.totalPeriods)
						return classSub;

					// ignoring duplicates values
					if (classSub[field1][field2].includes(newValue)) return classSub;

					// Inserting new value
					classSub[field1][field2].push(newValue);
				} else {
					classSub[field1][field2] = event.target.value;
				}
				setRecentSetting({
					slots: classSub.slots,
					frequencyPer: classSub.frequencyPer,
				});
			}
			return classSub;
		});
		setConstrainData(newConstrainData);
	};

	const updateConstrainData = (newClassSub, type) => {
		// can del multiple classSub invoked synchoronously at the delTeacher()
		setConstrainData((constrainData) => {
			let newConstrainData;
			if (type === "DEL") {
				newConstrainData = constrainData.filter(
					(classSub) => classSub.id !== newClassSub
				);
			} else if (type === "UPDATE") {
				let isKeyPresent = false;
				newConstrainData = constrainData.map((classSub) => {
					if (classSub.id === newClassSub.id) {
						classSub.subjectName = newClassSub.subjectName;
						classSub.classId = newClassSub.classId;
						isKeyPresent = true;
					}
					return classSub;
				});
				if (!isKeyPresent) {
					newClassSub = { ...newClassSub, ...DEFAULTCONSTRAIN(recentSetting) };
					newConstrainData.push(newClassSub);
					console.log(newClassSub);
				}
			}
			return newConstrainData;
		});
	};

	const toggleConstrainDetails = (id) => {
		const newConstrainData = constrainData.map((classSub) => {
			if (classSub.id === id)
				classSub._meta.showDetails = !classSub._meta.showDetails;
			return classSub;
		});
		setConstrainData(newConstrainData);
	};

	const handleGenerate = () => {
		setShowModal(true);
		setTimeout(() => {
			const table = generateTimeTable(
				parseInt(generalData.totalDays),
				parseInt(generalData.totalPeriods),
				teachersData,
				constrainData
			);
			setTable(table);
		}, 1000);
	};

	const deleteIcon = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			fill="currentColor"
			className="bi bi-trash"
			viewBox="0 0 16 16"
		>
			<path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
			<path
				fillRule="evenodd"
				d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
			/>
		</svg>
	);

	const dropDownIcon = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			fill="currentColor"
			className="bi bi-caret-down-fill"
			viewBox="0 0 16 16"
		>
			<path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
		</svg>
	);

	const rightArrow = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			fill="currentColor"
			className="bi bi-caret-right"
			viewBox="0 0 16 16"
		>
			<path d="M6 12.796V3.204L11.481 8 6 12.796zm.659.753 5.48-4.796a1 1 0 0 0 0-1.506L6.66 2.451C6.011 1.885 5 2.345 5 3.204v9.592a1 1 0 0 0 1.659.753z" />
		</svg>
	);

	const dropRightIcon = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			fill="currentColor"
			className="bi bi-caret-right-fill"
			viewBox="0 0 16 16"
		>
			<path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z" />
		</svg>
	);

	// useEffect(() => {
	// 	if (typeof window !== undefined) {
	// 		(adsgoogle = window.adsgoogle || []).push({});
	// 	}
	// }, []);

	const [showModal, setShowModal] = useState(false);

	const handleModalClose = () => {
		setShowModal(false);
	};

	return (
		<>
			<Modal
				show={showModal}
				closeModal={handleModalClose}
				table={table}
				generalData={generalData}
			/>
			<div className="container text-center p-3 mb-3">
				<h1 className="display-3">TimeTabler</h1>
				<p>2 minutes time tables</p>
			</div>

			<div
				style={{
					maxWidth: "1000px ",
					display: "flex",
					flexDirection: "column",
					marginLeft: "auto",
					marginRight: "auto",
				}}
			>
				{/* <div
					className="bg-light border text-center my-3 mx-3 p-5 adsbygoogle"
					data-ad-client="ca-ca-pub-2846658205429325"
					data-ad-slot="2846658205429325"
					data-ad-format="auto"
				>
					Google Ads
				</div> */}

				<div className="container my-3  gap-3 d-flex  justify-content-around">
					<div>
						<p>No of days / week</p>
						<input
							id="totalDays"
							className="w-75"
							type="number"
							placeholder="days / week"
							value={generalData.totalDays}
							onChange={changeGeneralInfo}
						/>
					</div>
					<div>
						<p>No of periods / day</p>
						<input
							id="totalPeriods"
							className="w-75"
							type="number"
							placeholder="periods / day"
							value={generalData.totalPeriods}
							onChange={changeGeneralInfo}
						/>
					</div>
				</div>

				<div className="row flex-nowrap mx-1" style={{ overflowX: "scroll" }}>
					<div className="" style={{ maxWidth: "500px" }}>
						<h1 className="fs-2 p-3">Teachers</h1>
						<div
							style={{
								overflowY: "scroll",
								height: "400px",
								// maxHeight: "400px",
								border: "1px dotted grey",
								scrollbarWidth: "thin",
								scrollbarColor: "rebeccapurple green",
								padding: "0.5rem",
							}}
						>
							<div className="d-flex gap-2 flex-wrap p-2">
								{teachersData.map((teacher, index) => (
									<div
										className="d-flex gap-2 bg-light w-100 mb-3 p-3 flex-wrap justify-content-end align-items-center"
										key={index}
									>
										<input
											id={teacher.id}
											type="text"
											className="w-75 btn-left"
											value={teacher.name}
											onChange={changeTeacherName}
											placeholder="Teacher name"
											required
										/>
										<button
											className="btn btn-right bg-red w-20"
											onClick={() => delTeacher(teacher.id)}
										>
											{deleteIcon}
										</button>
										{teacher.classSub.map((classSub, index) => (
											<div
												className="d-flex gap-2 flex-wrap justify-content-end align-items-center"
												key={index}
											>
												<div className="w-20 text-center">{index + 1}</div>
												<input
													id={[teacher.id, classSub.id, "classId"]}
													type="text"
													className="w-25"
													value={classSub.classId}
													onChange={changeClassSub}
													placeholder="class"
												/>
												<input
													id={[teacher.id, classSub.id, "subjectName"]}
													type="text"
													className="w-25"
													value={classSub.subjectName}
													onChange={changeClassSub}
													placeholder="subject"
												/>
												<button
													id={[teacher.id, classSub.id]}
													className="btn btn-right bg-red w-20"
													onClick={deleteClassSub}
												>
													{deleteIcon}
												</button>
											</div>
										))}
										<button
											id={teacher.id}
											className="btn bg-green w-75"
											onClick={addClassSub}
										>
											+
										</button>
									</div>
								))}
								<div
									className="w-100"
									style={{
										border: "1px dashed green",
										height: "70px",
										color: "green",
										margin: "auto",
										textAlign: "center",
										lineHeight: "70px",
										cursor: "pointer",
										// background:
										// 	"repeating-linear-gradient(45deg, #606dbc, #606dbc 10px, #465298 10px, #465298 10px)",
										// background: "rgba(255, 255, 255, 0.5)",
									}}
									onClick={addTeacher}
								>
									<p>Add Teacher</p>
									{/* Add Teacher */}
								</div>
							</div>
						</div>
						{/* <button className="btn bg-green w-100 mt-2">Add Teacher</button> */}
					</div>
					<div className="" style={{ maxWidth: "500px" }}>
						<div className="fs-2 p-3">
							<spam className="fs-2">Constrains</spam>
							{/* <button
								className="btn btn-left btn-dark "
								style={{ position: "relative", width: "100px", left: "-250px" }}
								disabled
							>
								{rightArrow}
								{rightArrow}
							</button> */}
						</div>

						<div
							className="p-3"
							style={{
								overflowY: "scroll",
								height: "400px",
								border: "1px dotted grey",
								padding: "0.5rem",
							}}
						>
							{constrainData.map((classSub) => (
								<div key={classSub.id} className="bg-light p-2 mb-3 ">
									<div
										className="row text-center py-2"
										style={{ cursor: "pointer" }}
										onClick={() => toggleConstrainDetails(classSub.id)}
									>
										<div className="col-4">
											<p className="fs-5">
												{classSub._meta.showDetails ? dropDownIcon : dropRightIcon}
											</p>
										</div>
										<div className="col-4">
											<p className="fs-5">
												<strong>{classSub.classId}</strong>
											</p>
										</div>
										<div className="col-4">
											<p className="fs-5">
												<strong>{classSub.subjectName}</strong>
											</p>
										</div>
									</div>

									{classSub._meta.showDetails && (
										<>
											<p className="m-0">Periods can be filled on :</p>
											<div className="d-flex justify-content-between">
												<p className=" m-0 py-3 w-auto px-2">Days</p>
												<input
													id={classSub.id}
													data-field1="slots"
													data-field2="days"
													type="text"
													className="w-25"
													value={classSub.slots.days}
													onChange={changeConstrainData}
												/>
												<p className=" m-0 py-3 w-auto px-2 ">Periods</p>
												<input
													id={classSub.id}
													data-field1="slots"
													data-field2="sessions"
													type="text"
													className="w-25"
													value={classSub.slots.sessions}
													onChange={changeConstrainData}
												/>
											</div>
											<p className="m-0 mt-2">Sessions per :</p>
											<div className="d-flex justify-content-between">
												<p className=" m-0 py-3 w-auto px-2">week</p>
												<input
													id={classSub.id}
													data-field1="frequencyPer"
													data-field2="week"
													type="number"
													className="w-25"
													value={classSub.frequencyPer.week}
													onChange={changeConstrainData}
												/>
												<p className=" m-0 py-3 w-auto px-2"> and space it </p>

												<select
													name="pets"
													id={classSub.id}
													data-field1="frequencyPer"
													data-field2="space"
													value={classSub.frequencyPer.space}
													onChange={changeConstrainData}
												>
													<option value="EVENLY" className="py-5">
														Evenly
													</option>

													<option value="ONEPERDAY"> 1 / day</option>
													<option value="ASYOUWISH"> as you wish</option>
												</select>
											</div>
										</>
									)}
								</div>
							))}
						</div>
						<p className="text-secondary p-2">
							* Adding / Removing constrain is automatic. You only need to Edit.
						</p>
					</div>
				</div>
				<div className="p-3">
					<button
						className="btn bg-done w-100"
						style={{ height: "50px" }}
						onClick={handleGenerate}
					>
						Generate Table
					</button>
				</div>

				{/* <div className="bg-light border text-center my-3 mx-3 p-5">Google Ads</div> */}

				{/* {table && (
					<>
						<h1 className="fs-2 p-3">Teacher&apos;s table</h1>
						<div className=" p-3" style={{ overflowY: "scroll", height: "500px" }}>
							{Object.entries(table.teacherTable).map((teacher) => (
								<table key={teacher[0]} className="table table-bordered bg-light">
									<thead>
										<tr>
											<th
												className="fs-5 p-2"
												scope="col"
												style={{ whiteSpace: "nowrap" }}
											>
												{teacher[0]}
											</th>
											{[...Array(parseInt(generalData.totalPeriods)).keys()].map((day) => (
												<th key={day} className="text-center" scope="col">
													{day + 1}
												</th>
											))}
										</tr>
									</thead>
									<tbody>
										{teacher[1].map((day, index) => (
											<tr key={index}>
												<th scope="row">{WEEEKDAYS[index]}</th>
												{day.map((period, index) => (
													<td className="p-2" key={index}>
														{period === "FREE" && <div className="fs-4 mx-3">{period}</div>}
														{period !== "FREE" && (
															<div>
																<div className="fs-4 me-4">{period[0]}</div>
																<div className="text-end ms-4" style={{ whiteSpace: "nowrap" }}>
																	{period[1]}
																</div>
															</div>
														)}
													</td>
												))}
											</tr>
										))}
									</tbody>
								</table>
							))}
						</div>
						<h1 className="fs-2 p-3">Class&apos;s table</h1>
						<div className=" p-3" style={{ overflowY: "scroll", height: "500px" }}>
							{Object.entries(table.classTable).map((classId) => (
								<table key={classId} className="table table-bordered bg-light">
									<thead>
										<tr>
											<th className="fs-5 p-2" scope="col">
												{classId[0]}
											</th>
											{[...Array(parseInt(generalData.totalPeriods)).keys()].map((day) => (
												<th key={day} className="text-center" scope="col">
													{day + 1}
												</th>
											))}
										</tr>
									</thead>
									<tbody>
										{classId[1].map((day, index) => (
											<tr key={index}>
												<th scope="row">{WEEEKDAYS[index]}</th>
												{day.map((period, index) => (
													<td className="p-2" key={index}>
														{period === "FREE" && <div className="fs-4 mx-3">{period}</div>}
														{period !== "FREE" && (
															<div>
																<div className="fs-4 me-4">{period[0]}</div>
																<div className="text-end ms-4" style={{ whiteSpace: "nowrap" }}>
																	{period[1]}
																</div>
															</div>
														)}
													</td>
												))}
											</tr>
										))}
									</tbody>
								</table>
							))}
						</div>
					</>
				)} */}
			</div>
		</>
	);
}

export default MainPage;
