import {BrowserRouter as Router,Route,Switch,Redirect,useLocation, useHistory} from "react-router-dom";
import { Helmet } from "react-helmet";
import axios from "axios";
import { useEffect, useState } from "react";
import SideBar from "./SideBar";
import Footer from "./Footer";
import FleetTable from "./FleetTable";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Templates from "./Templates";
import SingleFleet from "./SingleFleet";
import CreateFleetTemplate from "./CreateFleetTemplate";
import CreateCronTemplate from "./CreateCronTemplate";
import TopBar from "./TopBar";
import useUserObject from "./useUserObject";
import AccountPopup from "./EnvironmentPopup";
import LandingPage from "./LandingPage";
import SignUpPage from "./SignUpPage";
import StripeContainer from "./StripeContainer";
import SuccessPage from "./SuccessPage";
import SettingsPage from "./SettingsPage";
import ContributionsPage from "./ContributionsPage"
import ForgotPassword from "./ForgotPassword"; 
import Help from "./Help";
import Routes from "./util/RenderRoutes.json";
import { UserContext } from "./context/UserContext";
import { RegionContext } from "./context/RegionContext";
import ReactGA from "react-ga";
import CreateResourceTemplate from "./CreateResourceTemplate";
import CronTable from "./CronTable";
import FleetTemplatesTable from "./FleetTemplatesTable";
import EnvironmentTemplatesTable from "./EnvironmentTemplatesTable";
import ResourceTemplatesTable from "./ResourceTemplatesTable";

function Root() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const [accounts, setAccounts] = useState(['No Account']);
  const [selectedAccount, setSelectedAccount] = useState('No Account');
  const [selectedRegion, setSelectedRegion] = useState();
  const { user, setUser } = useUserObject();
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    // Initial page load tracking
    ReactGA.pageview(window.location.pathname + window.location.search);

    // Listen for changes in the history
    history.listen((location) => {
      ReactGA.pageview(location.pathname + location.search);
    });
  }, [history]);
  
  return (
    //user context provides the user object and method to be accessible by all files rendered in this route table
    <UserContext.Provider value={{ user, setUser }}>
      {/*same for the region context*/}
      <RegionContext.Provider value={{ selectedRegion, setSelectedRegion }}>
        {/* Check if user is present and if the route includes "app" */}
        {user && location.pathname.includes("app") ? (
          <div className='flex flex-row items-stretch min-h-screen h-full'>
            {!Routes.routes.includes(location.pathname) && <SideBar />}
            <div className='flex flex-col w-full min-h-screen h-full'>
              <TopBar
                setSelectedAccount={setSelectedAccount}
                selectedAccount={selectedAccount}
                accounts={accounts}
                setAccounts={setAccounts}
                selectedRegion={selectedRegion}
                setSelectedRegion={setSelectedRegion}
              />
              <Switch>
                <Route exact path='/app/'>
                  <Helmet>
                    <title>Dashboard - Cloudimate</title>
                    <meta
                      name='description'
                      content='Cloudimate application dashboard'
                    />
                  </Helmet>
                  <Dashboard selectedAccount={selectedAccount} />
                </Route>
                <Route exact path='/app/templates'>
                  <Helmet>
                    <title>Templates - Cloudimate</title>
                    <meta name='description' content='Template work area' />
                  </Helmet>
                  <Templates />
                </Route>
                <Route exact path='/app/templates/build/fleet-templates'>
                  <Helmet>
                    <title>Build Fleet Template - Cloudimate</title>
                    <meta
                      name='description'
                      content='Create a fleet template'
                    />
                  </Helmet>
                  <CreateFleetTemplate />
                </Route>
                <Route exact path='/app/templates/build/cron-templates'>
                  <Helmet>
                    <title>Build Cron Template - Cloudimate</title>
                    <meta name='description' content='Create a Cron template' />
                  </Helmet>
                  <CreateCronTemplate />
                </Route>
                <Route exact path='/app/templates/build/resource-templates'>
                  <Helmet>
                    <title>Build Resource Template - Cloudimate</title>
                    <meta name='description' content='Create a Cron template' />
                  </Helmet>
                  <CreateResourceTemplate />
                </Route>
                <Route exact path='/app/templates/fleet-templates'>
                  <Helmet>
                    <title>Manage Fleet Templates - Cloudimate</title>
                    <meta name='description' content='Manage Fleet Templates' />
                  </Helmet>
                  <Templates />
                  <FleetTemplatesTable />
                </Route>
                <Route exact path='/app/templates/cron-templates'>
                  <Helmet>
                    <title>Manage Cron Templates - Cloudimate</title>
                    <meta name='description' content='Manage Cron Templates' />
                  </Helmet>
                  <Templates />
                  <CronTable />
                </Route>
                <Route exact path='/app/templates/resource-templates'>
                  <Helmet>
                    <title>Manage Resource Template - Cloudimate</title>
                    <meta
                      name='description'
                      content='Manage Resource Templates'
                    />
                  </Helmet>
                  <Templates />
                  <ResourceTemplatesTable />
                </Route>
                <Route exact path='/app/templates/environment-templates'>
                  <Helmet>
                    <title>Manage Environment Template - Cloudimate</title>
                    <meta
                      name='description'
                      content='Manage Environment Templates'
                    />
                  </Helmet>
                  <Templates />
                  <EnvironmentTemplatesTable />
                </Route>
                <Route exact path='/app/fleets'>
                  <Helmet>
                    <title>Manage Fleets - Cloudimate</title>
                    <meta
                      name='description'
                      content='Fleet management dashboard'
                    />
                  </Helmet>
                  <FleetTable selectedAccount={selectedAccount} />
                </Route>

                <Route path='/app/fleets/:FleetName'>
                  <SingleFleet selectedAccount={selectedAccount} />
                </Route>
                <Route path='/app/settings'>
                  <Helmet>
                    <title>Settings - Cloudimate</title>
                    <meta name='description' content='Create a Cron template' />
                  </Helmet>
                  <SettingsPage
                    selectedRegion={selectedRegion}
                    setSelectedRegion={setSelectedRegion}
                  />
                </Route>
                <Route path='/app/help'>
                  <Helmet>
                    <title>Help Page - Cloudimate</title>
                    <meta name='description' content='Help page' />
                  </Helmet>
                  <Help />
                </Route>
                <Redirect to='/app/' />
              </Switch>
            </div>
          </div>
        ) : (
          <Switch>
            <Route exact path='/contributions'>
              <Helmet>
                <title>Contributions - Cloudimate</title>
                <meta
                  name='description'
                  content='Contributors. Authors and others.'
                />
              </Helmet>
              <ContributionsPage />
            </Route>
            <Route exact path='/subscription'>
              <Helmet>
                <title>subscription - Cloudimate</title>
                <meta
                  name='description'
                  content='Get a subsciption Get a subscription and start using Cloudimate'
                />
              </Helmet>
              <StripeContainer />
            </Route>
            <Route exact path='/'>
              <Helmet>
                <title>Welcome - Cloudimate</title>
                <meta
                  name='description'
                  content='Home page. Learn about Cloudimate'
                />
              </Helmet>
              <LandingPage />
            </Route>
            <Route exact path='/signup'>
              <Helmet>
                <title>Signup - Cloudimate</title>
                <meta name='description' content='Sign up to join Cloudimate' />
              </Helmet>
              <SignUpPage />
            </Route>
            <Route exact path='/free-trial/signup'>
              <Helmet>
                <title>Free trial - Cloudimate</title>
                <meta
                  name='description'
                  content='Try Couldimate for free with a free-trial'
                />
              </Helmet>
              <SignUpPage />
            </Route>
            <Route exact path='/free-trial'>
              <Helmet>
                <title>Free trial - Cloudimate</title>
                <meta
                  name='description'
                  content='Try Couldimate for free with a free-trial'
                />
              </Helmet>
              <StripeContainer />
            </Route>
            <Route exact path='/subscription/signup'>
              <Helmet>
                <title>Subscription - Cloudimate</title>
                <meta
                  name='description'
                  content='Get a subscription and start using Cloudimate'
                />
              </Helmet>
              <SignUpPage />
            </Route>
            <Route exact path='/successPage'>
              <SuccessPage />
            </Route>
            <Route exact path='/forgot-password'>
              <Helmet>
                <title>Forgot Password - Cloudimate</title>
                <meta
                  name='description'
                  content='Forgot your password? Reset it here.'
                />
              </Helmet>
              <ForgotPassword />
            </Route>
            <Route exact path='/signin'>
              <Helmet>
                <title>Login - Cloudimate</title>
                <meta name='description' content='Login to Cloudimate.' />
              </Helmet>
              <Login setUser={setUser} />
            </Route>
            {!user ? <Redirect to='/signin' /> : <Redirect to='/app/' />}
          </Switch>
        )}

        <Footer />
      </RegionContext.Provider>
    </UserContext.Provider>
  );
}

export default Root;
