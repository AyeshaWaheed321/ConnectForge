import React from "react";
import { Input } from "antd";

interface JsonEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  height?: string;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({ value, onChange, height = "200px" }) => {
  return (
    <div className="json-editor-container">
      <Input.TextArea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoSize={{ minRows: 10, maxRows: 20 }}
        style={{ height, fontFamily: "monospace" }}
        className="json-editor"
      />
    </div>
  );
};
