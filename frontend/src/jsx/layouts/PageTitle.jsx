import { Link } from "react-router-dom";

const PageTitle = ({ motherMenu, activeMenu }) => {

  const handleClick = (e) => {
    e.preventDefault(); // redirect stop
  };

  return (
    <div className="row page-titles mx-0">
      <ol className="breadcrumb">
        
        <li className="breadcrumb-item">
          <Link
           href="/" onClick={handleClick}>
            {motherMenu}
          </Link>
        </li>

        <li className="breadcrumb-item active">
          <Link href="/" onClick={handleClick} >
            {activeMenu}
          </Link>
        </li>

      </ol>
    </div>
  );
};

export default PageTitle;