import React, { useState } from "react";
import styles from "./styling/ResourceNavBar.module.css";
import DraggableResource from "./DragableResource";

const ResourceNavBar = ({resourceTemplates}) => {
    const uniqueIds = new Set();

    const uniqueTemplates = resourceTemplates.filter((template) => {
      if (uniqueIds.has(template.id)) {
        return false; 
      } else {
        uniqueIds.add(template.id);
        return true;
      }
    });

    return (
      <div className={styles.resourceBar}>
          <span className="text-center">Resource Drag and Drop</span>
        {uniqueTemplates.length &&
          uniqueTemplates.map((resource) => (
            <DraggableResource
              key={resource.id}
              resource={resource}
              type='Ec2'
            />
          ))}
      </div>
    );
}

export default ResourceNavBar