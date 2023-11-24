import { useState } from 'react';
import CreateEC2Template from "./CreateEC2Template";
import CreateRDSTemplate from "./CreateRDSTemplate";
import CreateELBTemplate from "./CreateRDSTemplate";
import SelectResourceTemplate from "./SelectResourceTemplate";

const CreateResourceTemplate = () => {
  const [page, setPage] = useState(100);
  
  const renderPage = () => {
        

    switch (page) {
      case 100:
        return <SelectResourceTemplate setPage={setPage} />;
      case 0o10:
        return <CreateEC2Template />;
      case 0o20:
        return <CreateRDSTemplate />;
      case 0o30:
        return <CreateELBTemplate />;
      default:
        return null;
    }
  };

  return <div>{renderPage()}</div>;
};

export default CreateResourceTemplate;
