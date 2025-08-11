type ButtonProps = {
  title: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

export default (props: ButtonProps) =>
  <button className="
            py-1 w-full rounded
            border-2 border-gray-200 dark:border-gray-300
            text-sm font-medium text-gray-700 dark:text-white
            hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500 hover:text-white hover:shadow"
    onClick={props.onClick}>
    {props.title}
  </button>