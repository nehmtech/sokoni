// Shows a rating out of 5. Pass onChange to make it clickable.
function Stars({ value = 0, onChange }) {
  return (
    <span className="inline-flex text-xl leading-none">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={`${n <= Math.round(value) ? "text-amber-400" : "text-stone-300"} ${
            onChange ? "cursor-pointer hover:scale-110" : "cursor-default"
          }`}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </span>
  );
}

export default Stars;
