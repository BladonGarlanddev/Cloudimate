import React, {useState} from "react";
import {useDrag} from "react-dnd";
import EC2 from "./assets/EC2.png";
import RDS from "./assets/RDS.png";
import NAT from "./assets/NAT.png";
import styles from "./styling/DraggableResource.module.css";

const DraggableResource = ({
  resource,
  removeResource,
  azIndex,
  subnetIndex,
  resourceIndex,
}) => {
  const [selectedResourceId, setSelectedResourceId] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "resource",
    item: { id: resource.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const getResourceImage = (resourceType) => {
    switch (resourceType) {
      case "EC2":
        return EC2;
      case "RDS":
        return RDS;
      case "NAT":
        return NAT;
    }
  };

  const imageSrc = getResourceImage(resource.resource_type);

  return (
    <div
      ref={drag}
      key={resource.id}
      className={styles.resourceContainer}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img src={imageSrc} className={styles.resourceIcon} />
      <span
        className='underline hover:cursor-pointer text-center'
        onClick={(e) => {
          e.preventDefault();
          if (selectedResourceId == resource.id) {
            setSelectedResourceId(null);
          } else {
            setSelectedResourceId(resource.id);
          }
        }}
      >
        {resource.template_name}
      </span>
      {selectedResourceId === resource.id && (
        <>
          <span className='text-center'>Description:</span>{" "}
          <span>{resource.description && resource.description}</span>
        </>
      )}
      {isHovered && (
        <div
          className={styles.closeButton}
          onClick={() => removeResource(resourceIndex, azIndex, subnetIndex)}
        >
          Remove
        </div>
      )}
    </div>
  );
};

export default DraggableResource;