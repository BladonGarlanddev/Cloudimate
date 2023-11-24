import React from "react";
import { Link, useHistory } from "react-router-dom";
import Logo from "./assets/white-cloud-logo.png";
import './styling/SideBar.css';

const SideBar = () => {
  const history = useHistory();
  return (
    <nav className='custom-sidebar pt-8 pb-16'>
      <div className='cloud-logo'>
        <img src={Logo} onClick={(e) => { e.stopPropagation(); history.push("/app/"); }} />
        <h1>Beta</h1>
        <h2>1.2.1</h2>
      </div>

      <div className='custom-links'>
        <div className='custom-link sm:border-t pt-8'>
          <Link
            to={"/app/"}
            className='custom-link-button sidebar-option lg:space-x-1'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              className='w-6 h-6 flex'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z'
              />
            </svg>
            <p className='custom-link-text'>Dashboard</p>
          </Link>
        </div>

        <div className='custom-link'>
          <Link
            to={"/app/fleets"}
            className='custom-link-button sidebar-option lg:space-x-1'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              className='w-6 h-6 flex'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z'
              />
            </svg>
            <p className='custom-link-text'>Fleets</p>
          </Link>
        </div>

        <div className='custom-link sm:border-b pb-8'>
          <Link
            to={"/app/templates"}
            className='custom-link-button sidebar-option lg:space-x-1'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              className='w-6 h-6 flex'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128.983-.349.266-.221.487-.504.638-.815a48.036 48.036 0 005.855.483c1.693-.064 3.373-.244 4.992-.518.003.294.02.591.02.883v0c0 1.243.84 2.25 1.875 2.25.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z'
              />
            </svg>
            <p className='custom-link-text'>Templates</p>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default SideBar;
