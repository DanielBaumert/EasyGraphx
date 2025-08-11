import { Children } from "react";

type NavbarProps = {
  children: React.ReactNode;
};

export default (props: NavbarProps) => 
  <div className='flex flex-row justify-between gap-1'>
    {props.children}
  </div>