import { Note } from "../types";
export default function NoteCard({
  note,
  onClick,
}: {
  note: Note;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition"
    >
      {" "}
      <h3 className="font-semibold mb-1">{note.title || "Untitled"}</h3>{" "}
      <p className="text-sm text-gray-600 line-clamp-4"> {note.content} </p>{" "}
      <span className="text-xs text-indigo-600 mt-2 inline-block">
        {" "}
        #{note.subject}{" "}
      </span>{" "}
    </div>
  );
}