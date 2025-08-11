
type NavbarItemProps = {
  title: string;
  onClick: () => void;
  isActive: boolean;
};

export default (props: NavbarItemProps) =>
  props.isActive ? (
    <div className={`py-1 w-full text-sm font-medium text-gray-700 rounded-t
      text-center select-none cursor-pointer bg-white dark:bg-[#3e3e3e] border-sky-400 border-x-2 border-t-2 dark:text-white`}
      onClick={props.onClick}
    >{props.title}</div>
  ) : (
    <div className={`py-1 w-full text-sm font-medium text-gray-700 rounded-t
      text-center select-none cursor-pointer border-gray-400 bg-white dark:bg-[#3e3e3e] border-2 border-b-sky-400 hover:border-sky-400 dark:text-white hover:text-gray-700 dark:hover:text-white`}
      onClick={props.onClick}
    >{props.title}</div>
  );