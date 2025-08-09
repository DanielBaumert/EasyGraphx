type Props = {
  children: string
}

export default (props: Props) =>
  props.children.split('\n').map((subStr) => {
    return (
      <>
        {subStr}
        <br />
      </>
    );
  });