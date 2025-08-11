import { IconDropDownArrow } from "..";

type TabContainerProps = {
  isExpanded: boolean;
  children: React.ReactNode;
  onToggleExpand: (state: boolean) => void;
};

export default (props: TabContainerProps) => {
  return (
    <div className={`relative flex flex-row gap-2 bg-white dark:bg-[#3e3e3e] rounded border-2 ${props.isExpanded
        ? "border-sky-400"
        : "border-red-400"
      } p-2 shadow mr-1`}>
      {props.children}
      <div className="absolute flex flex-row top-1.5 right-1">
        <div className={props.isExpanded ? 'group rotate-180' : 'group'} onClick={() => props.onToggleExpand(!props.isExpanded)}>
          <IconDropDownArrow />
        </div>
      </div>
    </div>
  );
}