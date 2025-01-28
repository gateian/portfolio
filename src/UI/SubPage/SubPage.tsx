import { PageWrapper } from "./SubPage.style";

export interface SubPageProps {
  title: string;
  children?: React.ReactNode;
  expand?: boolean;
}

const SubPage = (props: SubPageProps) => {
  return <PageWrapper>{props.children}</PageWrapper>;
};

export default SubPage;
