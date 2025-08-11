type ButtonDeleteProps = {
  title: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

export default (props: ButtonDeleteProps) => (
  <button
    className="py-1 w-full rounded mb-1 border border-gray-200 text-sm font-medium text-gray-700 dark:text-white hover:bg-red-500 hover:text-white hover:shadow"
    onClick={props.onClick}
  >
    {props.title}
  </button>
);
