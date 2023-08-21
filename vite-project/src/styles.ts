export const selectStyles = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	option:(provided: any, state: any) => ({
		...provided,
		color: state.isSelected ? "white" : "black",
	}),
}