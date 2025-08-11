type LabelProps = {
  title: string;
};

export default (props: LabelProps) =>
  <label className=" text-sm font-medium text-gray-700 dark:text-white w-100-full select-none">{props.title}</label>
