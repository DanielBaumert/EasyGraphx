type RadioProps = {
  id: string,
  title: string,
  initValue: boolean,
  onChanges?: React.ChangeEventHandler<HTMLInputElement>
}

export default (props: RadioProps) =>
  <div className="flex items-center mb-2 p-1 rounded hover:shadow dark:hover:bg-[#333333] group cursor-pointer">
    <input
      id={`checkbox-${props.id}`}
      className="w-3.5 h-3.5 text-sky-500 bg-gray-100 border-gray-300 rounded cursor-pointer"
      onChange={props.onChanges} type="checkbox" checked={props.initValue} />
    <label htmlFor={`checkbox-${props.id}`} className="pl-2 text-sm text-gray-900 dark:text-white w-full select-none cursor-pointer">{props.title}</label>
  </div>