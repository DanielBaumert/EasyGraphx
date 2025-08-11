import { ReactNode } from "react";

type ShowProps = {
  when: boolean;
  children: ReactNode;
  fallback?: ReactNode;
};

export default (props: ShowProps) => {
  return (props.when && <>{props.children}</>) || (props.fallback ?? null);
};