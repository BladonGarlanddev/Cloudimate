import React, {useState, useEffect} from 'react';
import styles from "./styling/helpPage.module.css";
import axiosInstance from "./api/axiosConfig";

const WelcomeComponent = () => {
  
  return (
  <div className={styles.contentContainer}>
    <h1>Welcome To Cloudimate</h1>
    <h2 className='mt-4'>What Can I Do With Cloudimate?</h2>
    <p>
      With Cloudimate, you can provision AWS resources using templates. The
      templates are reusable and intuitive to make. You can make these templates
      using the API or through the console. Documentation for the API is in the
      API section of help. More specifically, Cloudimate Currently supports
      automating appstream 2.0 fleet creation and network structure creation
      (VPC's, AZ's, subnets).
    </p>
    <h2 className='mt-4'>How Do I Use Cloudimate?</h2>
    <p>
      To use Cloudimate, start by following the steps in the set up section of
      the help page. Once you've done that, you can navigate to the console by
      either clicking the blue Cloudimate logo in your navigation bar or by
      modifying the url path to be '/app/'. From there, you can navigate to the
      Dashboard for metrics on cost, utilization, and information about your
      fleets. Or you can navigate to Fleets in your side bar to view information
      about your fleets, create fleets, delete fleets, etc. You can also begin
      making templates for cron jobs, fleets, or network structures by clicking
      the templates option.
    </p>
    <h2 className='mt-4'>How Do I Use Network Templates?</h2>
    <p>
      While at first the network templates may be confusing, you'll get the hang
      of it with practice. The premise is, you will always create one VPC per
      template. Each VPC can have multiple subnets in an AZ. The region in your
      nav bar determines the available AZ's. The plus and minus buttons next to
      each resource means that by clicking them, you can add or remove resources
      from a template. For example, if you click the add button on a subnet, it
      will create a new subnet in the same AZ. If you want a different AZ, click
      the add button below your subnet. Internet Gateways or IGWs first are
      attached to your VPC. If you want to provide your subnet with internet
      access, click to attach IGW button in your subnet. If its not showing,
      it's because you haven't added it to your VPC. You will notice there are
      input fields for IP addresses. Those are CIDR blocks that follow the
      format xxx.xxx.xxx.xxx/xx. If the entered information at any point doesn't
      adhere to AWS's network configuration requirements, you may get an error
      message when trying to save or submit the information. If you submit the
      information and don't recieve an error message from Cloudimate, you still
      may get an error from AWS. To edit a template that has already been
      created, select the template from the available list by checking the box.
      Modify the data as needed and hit save.
    </p>
    <h2 className='mt-4'>Features To Come</h2>
    <p>
      After the Beta version of Cloudimate becomes more refined, your options
      for templates will become vast. Soon you will be able to make a template
      for most items that can be put in a network structure and be able to drag
      and drop the resource into your network template and build that resource
      inside of the template. This will give you the power to set up a
      environment instantly as many times as you need whenever you need.
    </p>
  </div>
)};

const SetupComponent = () => {
  const axios = axiosInstance();

  const [externalID, setExternalID] = useState(null);

  const styles = {
    pre: {
      fontFamily: "monospace",
      whiteSpace: "pre-wrap",
      overflowX: "scroll",
      padding: "10px",
      border: "1px solid #ccc",
      borderRadius: "4px",
      backgroundColor: "#f5f5f5",
      maxHeight: "400px", // or whatever height you want
    },
  };

  const permissionPolicy = {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: "appstream:*",
        Resource: "*",
      },
      {
        Effect: "Allow",
        Action: [
          "ec2:CreateTags",
          "ec2:CreateVpc",
          "ec2:DeleteVpc",
          "ec2:ModifyVpcAttribute",
          "ec2:CreateSubnet",
          "ec2:DeleteSubnet",
          "ec2:CreateSecurityGroup",
          "ec2:DeleteSecurityGroup",
          "ec2:AuthorizeSecurityGroupIngress",
          "ec2:RevokeSecurityGroupIngress",
          "ec2:AuthorizeSecurityGroupEgress",
          "ec2:RevokeSecurityGroupEgress",
          "ec2:CreateRouteTable",
          "ec2:DeleteRouteTable",
          "ec2:CreateRoute",
          "ec2:DeleteRoute",
          "ec2:AssociateRouteTable",
          "ec2:DisassociateRouteTable",
          "ec2:CreateInternetGateway",
          "ec2:DeleteInternetGateway",
          "ec2:AttachInternetGateway",
          "ec2:DetachInternetGateway",
        ],
        Resource: "*",
      },
      {
        Effect: "Allow",
        Action: "iam:ListAccountAliases",
        Resource: "*",
      },
      {
        Effect: "Allow",
        Action: "rds:DescribeDBInstances",
        Resource: "*",
      },
    ],
  };

  const trustPolicy = {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::378448496750:role/AssumerRole"
            },
            "Action": "sts:AssumeRole",
            "Condition": {
                "StringEquals": {
                    "sts:ExternalId": externalID
                }
            }
        }
    ]
  };

  useEffect(() => {
    axios.get("/api/getExternalID")
    .then((response) => {
      setExternalID(response.data.externalID);
    })
    .catch((error) => {
      console.log(error);
    })
  }, [])

  return (
    <div className={styles.contentContainer}>
      <h1>Setup</h1>
      <h2 className='mt-4'>Security</h2>
      <p>
        Cloudimate offers 2 optional methods to increase your accounts security:
        API key rotation and MFA. To access these options, navigate to Account
        Settings in the user drop down. In Account, you will see Rotate API Key
        and Set Up MFA. Rotating your API key only requires you to click a
        button. To set up MFA, click Set Up MFA. From there you will be
        presented with a QR code. On your phone, go to Google Authenticator and
        scan the QR code. Once you have the code, enter it into the input field
        and submit it. You can view information about the events happening from
        the event window. After successfully setting up MFA, when you login you
        will see an additional MFA field after entering your email.
      </p>
      <h2 className='mt-4'>
        How To Link Cloudimate To Your AWS Account Or Organization
      </h2>
      <p>
        <li>Step 1: Navigate to IAM in AWS. Then, make a permission policy</li>
        <li>
          Step 2: enter the following JSON into your permission policy. If you
          don't want Cloudimate to have those permissions, you can opt to not
          include them but it will limit the ability of Cloudimate features.
          <pre style={styles.pre}>
            <code>{JSON.stringify(permissionPolicy, null, 2)}</code>
          </pre>
        </li>
        <li>Step 3: Navigate to IAM in AWS. Then, make a new Role</li>

        <li>
          Step 4: In Trusted entity type, select AWS account. In An AWS account,
          select 'Another AWS account'. From there, enter this{" "}
          <p className='font-bold'>account ID: 378448496750</p> After entering
          the account ID, select require external ID and enter your Cloudimate
          generated <p className='font-bold'>external ID: {externalID}</p>
          Click next.
        </li>
        <li>
          Step 5: Select the CloudimatePermissionsPolicy you made earlier to add
          it to your role. Then hit next.
        </li>
        <li>
          Step 6: Establish a trust relationship with Cloudimate by removing the
          current trust policy and replacing it with the policy below. You can
          set the name and description however you want. After that, you can
          create the role.
          <pre style={styles.pre}>
            <code>{JSON.stringify(trustPolicy, null, 2)}</code>
          </pre>
        </li>
        <li>
          Step 5: Now, navigate back to Cloudimate and enter the ARN of your new
          role in the Account settings area and submit the data. From there,
          your associated AWS account should appear in Cloudimates navigation
          bar. If not, you likely made an error somewhere. Look for errors and
          if all else fails, try it again. For further assistance, contact
          tech@cloudimate.tech.
        </li>
      </p>
    </div>
  );
};

const Billing = () => (
  <div className={styles.contentContainer}>
    <h1>Billing</h1>
    <h2 className='mt-4'>Subscriptions</h2>
    <p>
      Your subscription will charge you 15$ USD each month until the month after
      you cancel your subscription. If you have a free-trial, you will be
      charged after the trial ends. To view your subscription information such
      as your next billing cycle or free-trial end date, navigate to settings
      and go to billing.
    </p>
    <h2 className='mt-4'>How Do I Cancel My Subscription?</h2>
    <p>
      Navigate to settings and go to billing. From there, you will see a blue
      link that says cancel subscription. Clicking it will end your
      subscription. Check the events area to confirm your subscription was
      canceled. If there was an error canceling, try again. If the error
      persists, contact customer support.
    </p>
  </div>
);

const API = () => (
  <div className={styles.contentContainer}>
    <h1>API Documentation</h1>
    <h2 className='mt-5'>Base URL Endpoint</h2>
    <p>Base: https://api.cloudimate.tech </p>
    <h2 className='mt-5'>Headers</h2>
    <p>
      Authorization: Bearer *your api key*, X-User-Email: *your email*,
      X-Region: *your region*
    </p>

    <h2 className='mt-5'>Get Fleet Templates</h2>
    <p>Path: /api/getFleetTemplates</p>
    <p>Request Type: GET</p>

    <h2 className='mt-5'>Make Appstream Fleet</h2>
    <p>Path: /api/aws/makeFleet</p>
    <p>Request Type: POST</p>
    <p>
      Request Body:
      <pre>{`{template_name: *your_template_name*}`}</pre>
    </p>

    <h2 className='mt-5'>Get Network Templates</h2>
    <p>Path: /api/getNetworkTemplates</p>
    <p>Request Type: GET</p>

    <h2 className='mt-5'>Make Network Structure</h2>
    <p>Path: /api/aws/createNetworkStructure</p>
    <p>Request Type: POST</p>
    <p>
      Request Body:
      <pre>{`{template_name: *your_template_name*, network_structure: *network structure json*}`}</pre>
    </p>

    <h2 className='mt-5'>Test Cloudimate To AWS Connection</h2>
    <p>Path: /api/aws/testConnection</p>
    <p>Request Type: GET</p>
  </div>
);


const Help = () => {
    const [displayItem, setDisplayItem] = useState('welcome');

    function renderContent() {
      switch (displayItem) {
        case "welcome":
          return <WelcomeComponent />;
        case "setup":
          return <SetupComponent />;
        case "billing":
          return <Billing />;
        case "api":
          return <API />;
        default:
          return null;
      }
    }

    return (
      <div className={styles.helpPage}>
        <nav className={styles.sideNav}>
          <li
            className={`${displayItem === "welcome" ? styles.selected : ""}`}
            onClick={() => setDisplayItem("welcome")}
          >
            Welcome
          </li>
          <li
            className={`${displayItem === "setup" ? styles.selected : ""}`}
            onClick={() => setDisplayItem("setup")}
          >
            Set up
          </li>
          <li
            className={`${displayItem === "billing" ? styles.selected : ""}`}
            onClick={() => setDisplayItem("billing")}
          >
            Billing
          </li>
          <li
            className={`${displayItem === "api" ? styles.selected : ""}`}
            onClick={() => setDisplayItem("api")}
          >
            API
          </li>
        </nav>
        <div className={styles.contentArea}>{renderContent()}</div>
      </div>
    );
}

export default Help;