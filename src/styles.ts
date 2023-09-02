/* eslint-disable @typescript-eslint/no-explicit-any */
export const selectStyles = {
	option:(provided: any, state: any) => ({
		...provided,
		color: state.isSelected ? "white" : "black",
	}),
	container: (provided: any) => ({
		...provided,
		width: "100%",
		flex: 1,
	}),
}