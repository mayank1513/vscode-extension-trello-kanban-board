import { ColorPicker, useColor } from "react-color-palette";
import "react-color-palette/css";

export function ColorSelector(props: { color?: string; setColor: (color: string) => void; onClose: () => void }) {
  const [color, setColor] = useColor(props.color || "gray");
  return (
    <div className="modal">
      <div className="content">
        <ColorPicker hideInput={["rgb", "hsv"]} color={color} onChange={setColor} />
        <button onClick={() => props.setColor(color.hex)}>Ok</button>
        <button onClick={props.onClose}>Cancel</button>
      </div>
    </div>
  );
}
