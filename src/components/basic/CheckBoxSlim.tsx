type RadioSlimProps = {
  id: string,
  title: string,
  value: boolean,
  onChanges?: React.ChangeEventHandler<HTMLInputElement>
}


export default (props: RadioSlimProps) =>
  <div className="flex items-center p-1 rounded hover:shadow w-full">
    <input
      id={`checkbox-${props.id}`}
      className="w-3.5 h-3.5 text-sky-600 bg-gray-100 border-gray-300 rounded"
      onChange={props.onChanges} type="checkbox" checked={props.value} />
    <label htmlFor={`checkbox-${props.id}`} className="pl-2 text-sm text-gray-900 w-full">{props.title}</label>
  </div>