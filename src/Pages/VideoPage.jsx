import { useState, useCallback } from "react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import styled from "styled-components";
import { Oval } from "react-loader-spinner";
import Cropper from "react-easy-crop";
import { useNavigate } from "react-router-dom"
import { useContext } from "react";

import Context from "../context/Context";

const Container = styled.div`
	width: 80%;
	border: 1px solid red;
	margin: auto;
`;

const H1 = styled.h1`
    margin: 10px;
	color: Blue;
`;
const Img = styled.img`
	width: 960px;
`;
const Button = styled.button`
	display: block;
	margin: 10px;
	width: 200px;
    height: 35px;
    border-radius: 5px;
    border: 2px solid black;
`;

const Input = styled.input`
    margin: 10px;
`

const Video = styled.video`
	// height: 50vh;
`;

const CropperDiv = styled.div`
  border: 1px solid red;
  height 1600px;
  width: 1600px;
  position: relative;
`;

function VideoPage() {
    const navigate = useNavigate()
    const { context, setContext } = useContext(Context)

	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);

	const [videoSrc, setVideoSrc] = useState("");
	const [previewSrc, setPreviewSrc] = useState("");
	const [message, setMessage] = useState("Click Start to transcode");
	const [showVideo, setShowVideo] = useState(false);
	const [showPreview, setShowPreview] = useState(false);
	const [showCrop, setShowCrop] = useState(false);
	const [showSpinner, setShowSpinner] = useState(false);
	const [measurements, setMeasurements] = useState({});
	const [cropBtnDisabled, setCropBtnDisabled] = useState(true);
	const [startCropBtnDisabled, setStartCropBtnDisabled] = useState(true);
	const [transcodeBtnDisabled, setTranscodeBtnDisabled] = useState(true);

	const ffmpeg = createFFmpeg({
		log: true,
	});

	const [selectedFileUrl, setSelectedFileUrl] = useState();

	const handleFileSelected = async (e) => {
		e.preventDefault();
		setCropBtnDisabled(false);
        setTranscodeBtnDisabled(false)
		const url = URL.createObjectURL(e.target.files[0]);
		setSelectedFileUrl(url);
        setContext({
            ...context,
            fileUrl: url
        })
		await ffmpeg.load();
		ffmpeg.FS("writeFile", "test.mov", await fetchFile(url));
		await ffmpeg.run("-i", "test.mov", "-ss", "00:00:01.000", "-vframes", "1", "preview.png");
		setShowPreview(true);
		const data = ffmpeg.FS("readFile", "preview.png");
		setPreviewSrc(URL.createObjectURL(new Blob([data.buffer], { type: "png" })));
		setContext({
            ...context,
            previewUrl: URL.createObjectURL(new Blob([data.buffer], { type: "png" }))
        }
        )
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
		setShowPreview(false);
		setShowVideo(true);
		const data = ffmpeg.FS("readFile", "test.mp4");
		setVideoSrc(URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" })));
	};

	const handleCrop = async () => {
        setStartCropBtnDisabled(true)
        setShowCrop(false)
		setMessage("Loading ffmpeg-core.js");
		await ffmpeg.load();
		setMessage("Start Crop");
		setShowSpinner(true);
		ffmpeg.FS("writeFile", "test.mov", await fetchFile(selectedFileUrl));
		setMessage("Cropping...");
		await ffmpeg.run("-i", "test.mov", "-filter:v", `crop=1080:1080:${measurements.x}:${measurements.y}`, "test.mp4");
		setShowSpinner(false);
		setMessage("Crop Complete");
		setShowPreview(false);
		setShowVideo(true);
		const data = ffmpeg.FS("readFile", "test.mp4");
		setVideoSrc(URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" })));

	};

    const handleShowCrop = () => {
        setShowPreview(false)
        setShowCrop(true)
        setStartCropBtnDisabled(false)
        setCropBtnDisabled(true)
        setTranscodeBtnDisabled(true)
    }

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
				<Input type="file" name="file" onChange={handleFileSelected} />
			</div>
			<Button onClick={handleShowCrop} disabled={cropBtnDisabled}>
				Crop
			</Button>
			<Button onClick={handleCrop} disabled={startCropBtnDisabled}>
				Start Crop
			</Button>
			<Button onClick={handleTranscode} disabled={transcodeBtnDisabled}>
				Transcode
			</Button>
			<p>{message}</p>
			{showSpinner && <Oval color="#00BFFF" height={40} width={40} />}
			{showPreview && <Img src={context.previewUrl} alt="preview" />}
			{showCrop && (
				<CropperDiv>
					<Cropper
						image={context.previewUrl}
						crop={crop}
						zoom={zoom}
						aspect={1 / 1}
						onCropChange={setCrop}
						onCropComplete={onCropComplete}
						onZoomChange={setZoom}
					/>
				</CropperDiv>
			)}
			{showVideo && <Video src={videoSrc} controls></Video>}
		</Container>
	);
}

export default VideoPage;
