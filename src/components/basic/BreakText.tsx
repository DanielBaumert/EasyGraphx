type Props = {
  children: string
}

export default (props: Props) =>
  props.children.split('\n').map((subStr, index) => 
        <p key={index}>{subStr}</p>);