import { useZxing } from "react-zxing";

function BarcodeScanner({ onResult }) {
  const { ref } = useZxing({
    paused: false,
    constraints: {
      video: {
        facingMode: "environment",
      },
    },
    onDecodeResult(result) {
      onResult(result.getText());
    },
    onError(error) {
      console.error("Scanner error:", error);
    },
  });

  return (
    <video
      ref={ref}
      style={{ width: "100%", maxWidth: "400px", display: "block" }}
    />
  );
}

export default BarcodeScanner;
