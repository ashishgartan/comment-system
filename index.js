window.onload = () => {
  renderAllComments();
};

const loadComments = () => JSON.parse(localStorage.getItem("comments") || "[]");
const saveComments = (comments) =>
  localStorage.setItem("comments", JSON.stringify(comments));

function addComment(parentId, inputId = "main-comment-input") {
  const input = document.getElementById(inputId);
  const text = input.value.trim();
  if (!text) return;
  const comments = loadComments();
  comments.push({
    id: Date.now(),
    parentId: parentId,
    userId: "guest",
    text: text,
    timestamp: new Date().toISOString(),
    deleted: false,
    likes: 0,
    dislikes: 0,
  });

  saveComments(comments);
  input.value = "";
  renderAllComments();
}

function renderAllComments() {
  const comments = loadComments();
  const container = document.getElementById("comment-container");
  container.innerHTML = "";
  renderRecursive(comments, null, container);
}

function renderRecursive(comments, parentId, container) {
  comments
    .filter((comment) => comment.parentId === parentId)
    .forEach((comment) => {
      const card = document.createElement("div");
      card.className = "card";

      const cardBody = document.createElement("div");
      cardBody.className = "card-body";

      const header = document.createElement("h6");
      header.className = "card-subtitle mb-2 text-muted";
      header.textContent = `${comment.userId} • ${new Date(
        comment.timestamp
      ).toLocaleString()}`;

      const content = document.createElement("p");
      content.className = "card-text";
      content.textContent = comment.deleted
        ? "[Comment deleted]"
        : comment.text;

      // Like button
      const likeBtn = document.createElement("button");
      likeBtn.className = "btn btn-sm btn-outline-success me-1";
      likeBtn.innerHTML = comment.likes > 0 ? `👍 ${comment.likes}` : `👍`;
      likeBtn.disabled = comment.deleted;
      likeBtn.onclick = () => {
        comment.likes++;
        saveComments(comments);
        renderAllComments();
      };

      // Dislike button
      const dislikeBtn = document.createElement("button");
      dislikeBtn.className = "btn btn-sm btn-outline-danger me-1";
      dislikeBtn.innerHTML =
        comment.dislikes > 0 ? `👎 ${comment.dislikes}` : `👎`;
      dislikeBtn.disabled = comment.deleted;
      dislikeBtn.onclick = () => {
        comment.dislikes++;
        saveComments(comments);
        renderAllComments();
      };

      // Reply button
      const replyBtn = document.createElement("button");
      replyBtn.className = "btn btn-sm btn-outline-primary me-1";
      replyBtn.textContent = "Reply";
      replyBtn.disabled = comment.deleted;
      replyBtn.onclick = () => {
        const replyBoxId = `reply-${comment.id}`;
        if (!document.getElementById(replyBoxId)) {
          const replyDiv = document.createElement("div");
          replyDiv.className = "mt-2";
          replyDiv.innerHTML = `
            <textarea class="form-control mb-2" id="${replyBoxId}" rows="2" placeholder="Reply..."></textarea>
            <button class="btn btn-sm btn-success" onclick="addComment(${comment.id}, '${replyBoxId}')">Submit Reply</button>
          `;
          cardBody.appendChild(replyDiv);
        }
      };

      // Delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn btn-sm btn-outline-secondary me-1";
      deleteBtn.textContent = "Delete";
      deleteBtn.disabled = comment.deleted;
      deleteBtn.onclick = () => {
        comment.text = "";
        comment.deleted = true;
        saveComments(comments);
        renderAllComments();
      };

      cardBody.appendChild(header);
      cardBody.appendChild(content);
      cardBody.appendChild(likeBtn);
      cardBody.appendChild(dislikeBtn);
      cardBody.appendChild(replyBtn);
      cardBody.appendChild(deleteBtn);

      card.appendChild(cardBody);
      container.appendChild(card);

      const repliesDiv = document.createElement("div");
      repliesDiv.className =
        "ms-4 ps-3 border-start border-2 border-secondary mt-2 d-flex flex-column gap-2";
      container.appendChild(repliesDiv);

      renderRecursive(comments, comment.id, repliesDiv);
    });
}

renderAllComments();
