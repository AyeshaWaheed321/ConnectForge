import React from "react";
import { Modal, Button } from "antd";

interface GenericModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSubmit?: () => void;
  footer?: React.ReactNode;
  content: React.ReactNode;
}

const GenericModal: React.FC<GenericModalProps> = ({
  visible,
  title,
  onClose,
  onSubmit,
  footer,
  content,
}) => {
  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onClose}
      footer={footer}
      width={700}
    >
      {content}
    </Modal>
  );
};

export default GenericModal;
