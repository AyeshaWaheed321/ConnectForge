import React from "react";
import { Input } from "antd";

interface JsonEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  height?: string;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({
  value,
  onChange,
  height = "300px",
}) => {
  return (
    <div className="json-editor-container">
      <Input.TextArea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        // autoSize={{ minRows: 10, maxRows: 20 }}
        style={{ height, fontFamily: "monospace", fontSize: "12px" }}
        className="json-editor"
      />
    </div>
  );
};
