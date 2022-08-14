import { useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import Context from "../context/Context";
import styled from "styled-components";

const CropperDiv = styled.div`
  border: 1px solid red;
  height 1600px;
  width: 1600px;
  position: relative;
`;

const VideoCroppingPage = () => {
	const { context, setContext } = useContext(Context);
	const navigate = useNavigate();

	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
		console.log(croppedArea, croppedAreaPixels);
		// setMeasurements(croppedAreaPixels);
        setContext({
            ...context,
            measurements: croppedAreaPixels
        })
	}, [context, setContext]);

	return (
		<>
			<h1>{context.test}</h1>
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
                <button handleCrop={context.crop()}>Crop</button>
			</CropperDiv>
		</>
	);
};

export default VideoCroppingPage;
