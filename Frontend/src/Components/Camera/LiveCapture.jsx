import React, { useRef, useState, useCallback } from 'react';

const LiveCapture = ({ onCapture }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);

    const startCamera = async () => {
        setError(null);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' } // Prefer back camera
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            setError("Unable to access camera. Please ensure permissions are granted.");
            console.error("Camera Error:", err);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const capturePhoto = useCallback(() => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            setCapturedImage(dataUrl);
            onCapture(dataUrl);
            stopCamera(); // Stop camera after capture
        }
    }, [onCapture, stream]);

    const retake = () => {
        setCapturedImage(null);
        startCamera();
    };

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-4 border-2 border-dashed border-gray-300 min-h-[300px]">
            {error && <div className="text-red-500 mb-4">{error}</div>}

            {!stream && !capturedImage && (
                <button
                    onClick={startCamera}
                    className="flex flex-col items-center text-gray-500 hover:text-orange-600 transition"
                >
                    <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium">Take Live Photo</span>
                </button>
            )}

            {stream && !capturedImage && (
                <div className="relative w-full max-w-sm">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full rounded-lg shadow-lg"
                    />
                    <button
                        onClick={capturePhoto}
                        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-4 shadow-lg hover:bg-gray-100 active:scale-95 transition"
                        aria-label="Capture"
                    >
                        <div className="w-6 h-6 bg-red-600 rounded-full border-2 border-white"></div>
                    </button>
                </div>
            )}

            {capturedImage && (
                <div className="relative w-full max-w-sm">
                    <img src={capturedImage} alt="Captured" className="w-full rounded-lg shadow-lg" />
                    <button
                        type="button"
                        onClick={retake}
                        className="absolute top-2 right-2 bg-gray-800 bg-opacity-75 text-white p-2 rounded-full hover:bg-opacity-100 transition"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

export default LiveCapture;
