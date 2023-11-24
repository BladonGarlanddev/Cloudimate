import React, { useState } from "react";
import { useDrop } from "react-dnd";
import DraggableResource from "./DragableResource";
import styles from "./styling/ResourceGrid.module.css";

/*{
      ami_id: "aa",
      created_at: null,
      delete_on_termination: true,
      description: "a",
      ebs_optimized: false,
      iam_role: {
        RoleId: "AROAVQHKJZBXEX4TFPYAM",
        RoleName: "ApplicationAutoScalingForAmazonAppStreamAccess",
      },
      id: 1,
      instance_type: "t4g.micro",
      security_group_ids: ["sg-084b97b72ffadfe5a", "sg-02933d7a93d544e22"],
      template_name: "a",
      updated_at: null,
      volume_size: "1",
      volume_size_unit: "TiB",
      volume_type: "gp3",
    },
    */

const ResourceGrid = ({ resourceTemplates }) => {
  const [grid, setGrid] = useState([
    
  ]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "resource",
    drop: (item) => addResourceToGrid(item.id),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const addResourceToGrid = (id) => {
    const list = resourceTemplates.filter((resource) => id === resource.id);
    setGrid((grid) => [...grid, list[0]]);
  };

  return (
    <div ref={drop} className={styles.gridContainer}>
      {grid.length > 0 ? (grid.map((resource, index) => (
        <div key={index} className={styles.gridCell}>
          {resource && <DraggableResource resource={resource} />}
        </div>
      ))) : (
        <div className={styles.emptyGrid}>
          <span className={styles.emptyGridText}>Drag Resources Here</span>
        </div>
      ) }
    </div>
  );
};

export default ResourceGrid;
