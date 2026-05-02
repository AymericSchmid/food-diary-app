export const BOX_COLORS = [
    {
        border: "#ef4444",
        background: "rgba(239, 68, 68, 0.1)",
    },
    {
        border: "#3b82f6",
        background: "rgba(59, 130, 246, 0.1)",
    },
    {
        border: "#22c55e",
        background: "rgba(34, 197, 94, 0.1)",
    },
    {
        border: "#eab308",
        background: "rgba(234, 179, 8, 0.1)",
    },
    {
        border: "#a855f7",
        background: "rgba(168, 85, 247, 0.1)",
    },
    {
        border: "#ec4899",
        background: "rgba(236, 72, 153, 0.1)",
    },
    {
        border: "#f97316",
        background: "rgba(249, 115, 22, 0.1)",
    },
    {
        border: "#000000",
        background: "rgba(0, 0, 0, 0.1)",
    },
    {
        border: "#6adac7",
        background: "rgba(113, 218, 209, 0.1)",
    }
]

export function getBoxColor(index: number) {
    return BOX_COLORS[index % BOX_COLORS.length]
}