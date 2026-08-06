import useLogout from './useLogout';

function LogoutPage() {
  const logout = useLogout();

  return (
    <>
      <button className="dropdown-item ai-icon" onClick={logout}>
        <svg
          id="icon-logout"
          xmlns="http://www.w3.org/2000/svg"
          className="text-danger"
          width={18}
          height={18}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1={21} y1={12} x2={9} y2={12} />
        </svg>
        <span className="ms-2">Logout</span>
      </button>
    </>
  );
}

export default LogoutPage;
