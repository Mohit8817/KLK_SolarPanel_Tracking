import PageHeader from "../components/Common/PageHeader";

/**
 * Legacy wrapper — renders the shared PageHeader so all pages get
 * the same breadcrumb bar and top heading.
 *
 * @param {string} activeMenu  Page title (also last breadcrumb)
 * @param {string} motherMenu  Section name (middle breadcrumb)
 * @param {string} [motherLink] Optional link for the section breadcrumb
 * @param {string} [pageContent] Legacy subtitle
 */
const PageTitle = ({
  activeMenu,
  motherMenu,
  motherLink,
  subtitle,
  pageContent,
  action,
}) => {
  const breadcrumbs = [{ label: "Dashboard", to: "/dashboard" }];

  if (motherMenu) {
    breadcrumbs.push(
      motherLink
        ? { label: motherMenu, to: motherLink }
        : { label: motherMenu }
    );
  }

  if (activeMenu && activeMenu !== motherMenu) {
    breadcrumbs.push({ label: activeMenu });
  }

  return (
    <PageHeader
      title={activeMenu}
      subtitle={subtitle || pageContent}
      breadcrumbs={breadcrumbs}
      action={action}
    />
  );
};

export default PageTitle;
