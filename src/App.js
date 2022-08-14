import React, { useState, useCallback } from "react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import styled from "styled-components";
import { Oval } from "react-loader-spinner";
import Cropper from "react-easy-crop";

const Container = styled.div`
	width: 80%;
	border: 1px solid red;
	margin: auto;
`;

const H1 = styled.h1`
	color: red;
`;
const Img = styled.img`
	// height: 50vh;
`;
const Button = styled.button`
	display: block;
	margin: 10px;
	width: 200px;
`;

const Video = styled.video`
	// height: 50vh;
`;

const CropperDiv = styled.div`
  border: 1px solid red;
  height 1600px;
  width: 1600px;
  position: relative;
`;

function App() {
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);

	const [videoSrc, setVideoSrc] = useState("");
	const [thumbnailSrc, setThumbnailSrc] = useState("");
	const [message, setMessage] = useState("Click Start to transcode");
	const [showVideo, setShowVideo] = useState(false);
	const [showThumbnail, setShowThumbnail] = useState(false);
  const [showCrop, setShowCrop] = useState(false)
	const [showSpinner, setShowSpinner] = useState(false);
	const [measurements, setMeasurements] = useState({});
	const [buttonsDisabled, setButtonsDisabled] = useState(true);

	const ffmpeg = createFFmpeg({
		log: true,
	});

	const [selectedFileUrl, setSelectedFileUrl] = useState();

	const handleFileSelected = async (e) => {
		e.preventDefault();
    setButtonsDisabled(false)
		const url = URL.createObjectURL(e.target.files[0]);
		setSelectedFileUrl(url);
    await ffmpeg.load();
    ffmpeg.FS("writeFile", "test.mov", await fetchFile(url));
    await ffmpeg.run("-i", "test.mov", "-ss", "00:00:01.000", "-vframes", "1", "thumbnail.png");
    setShowThumbnail(true);
    const data = ffmpeg.FS("readFile", "thumbnail.png");
    setThumbnailSrc(URL.createObjectURL(new Blob([data.buffer], { type: "png" })));
	};

	const handleCreateThumbnail = async () => {
	};

	const handleTranscode = async () => {
		setMessage("Loading ffmpeg-core.js");
		await ffmpeg.load();
		setMessage("Start transcoding");
		setShowSpinner(true);
		ffmpeg.FS("writeFile", "test.mov", await fetchFile(selectedFileUrl));
		setMessage("transcoding...");
		await ffmpeg.run("-i", "test.mov", "test.mp4"); // transcode
		setMessage("Transcoding Complete");
		setShowSpinner(false);
		setShowThumbnail(false);
		setShowVideo(true);
		const data = ffmpeg.FS("readFile", "test.mp4");
		setVideoSrc(URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" })));
	};

	const handleCrop = async () => {
		setMessage("Loading ffmpeg-core.js");
		await ffmpeg.load();
		setMessage("Start Crop");
		setShowSpinner(true);
		ffmpeg.FS("writeFile", "test.mov", await fetchFile(selectedFileUrl));
		setMessage(`Cropping X: ${measurements.x}, Y: ${measurements.y}`);
		await ffmpeg.run("-i", "test.mov", "-filter:v", `crop=1080:1080:${measurements.x}:${measurements.y}`, "test.mp4");
		setShowSpinner(false);
		setMessage("Crop Complete");
		setShowThumbnail(false);
		setShowVideo(true);
		const data = ffmpeg.FS("readFile", "test.mp4");
		setVideoSrc(URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" })));
	};

	const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
		console.log(croppedArea, croppedAreaPixels);
		console.log(croppedArea);
		setMeasurements(croppedAreaPixels);
	}, []);

	console.log("X:", measurements.x, " Y:", measurements.y);

	return (
		<Container>
			<p />
			<H1>Video Page</H1>
			<div>
				<input type="file" name="file" onChange={handleFileSelected} />
			</div>
			<Button onClick={handleCreateThumbnail} disabled={buttonsDisabled}>
				Preview
			</Button>
			<Button onClick={handleCrop} disabled={buttonsDisabled}>
				Crop
			</Button>
			<Button onClick={handleTranscode} disabled={buttonsDisabled}>
				Transcode
			</Button>
			<p>{message}</p>
			{showSpinner && <Oval color="#00BFFF" height={40} width={40} />}
      {showThumbnail && <Img src={thumbnailSrc} alt="preview" />}
			{/* {showThumbnail && (
				<CropperDiv>
					<Cropper
						image={thumbnailSrc}
						crop={crop}
						zoom={zoom}
						aspect={1 / 1}
						onCropChange={setCrop}
						onCropComplete={onCropComplete}
						onZoomChange={setZoom}
					/>
				</CropperDiv>
			)} */}
			{showVideo && <Video src={videoSrc} controls></Video>}
		</Container>
	);
}

export default App;
