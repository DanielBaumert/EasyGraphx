type LabelProps = {
  title: string;
};

export default (props: LabelProps) =>
  <label className="text-xs font-small text-gray-500 dark:text-gray-200 w-100-full select-none">{props.title}</label>
