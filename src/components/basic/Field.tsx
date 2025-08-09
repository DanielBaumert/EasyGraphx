
type FieldProps = {
  title: string;
  initValue?: string;
  onInputChange?: React.ChangeEventHandler<HTMLInputElement>;
};

export default (props: FieldProps) => {
    return (
      <div className="relative z-0 w-full mt-3 group">
        <input id={this}
          defaultValue={props.initValue ?? ""}
          onChange={props.onInputChange}
          placeholder=" "
          className="block mb-1 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" />
        <label htmlFor={this}
          className="peer-focus:font-medium select-none absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-7 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-2.5 peer-focus:scale-75 peer-focus:-translate-y-7">
          {props.title}
        </label>
      </div>
    );
  }