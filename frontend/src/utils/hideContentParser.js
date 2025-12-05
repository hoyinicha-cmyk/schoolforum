/**
 * Parse and handle [HIDEUSER=@username]content[/HIDEUSER] BBCode tags
 * Content is only visible to the post author and the specified user
 */

const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

const linkifyText = (text) => {
  if (!text) return text;
  
  // URL regex pattern - detects http://, https://, and www. URLs
  const urlPattern = /(https?:\/\/[^\s<]+)|(www\.[^\s<]+)/g;
  
  return text.replace(urlPattern, (url) => {
    // Add https:// if URL starts with www.
    const href = url.startsWith('www.') ? `https://${url}` : url;
    
    // Escape the URL for display (not the href)
    const displayUrl = url.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline break-all" style="color: #2563eb; text-decoration: underline; word-break: break-all;">${displayUrl}</a>`;
  });
};

export const parseHideContent = (content, currentUserId, postAuthorId, currentUserFirstName, currentUserRole, moderatorOverride = false) => {
  if (!content) return content;

  console.log('🔍 parseHideContent called:', {
    content: content.substring(0, 100),
    currentUserId,
    postAuthorId,
    currentUserFirstName,
    currentUserRole,
    moderatorOverride,
    hasHideUserTag: content.includes('[HIDEUSER=')
  });

  // Check if user is contributor or higher
  const isContributor = ['contributor', 'moderator', 'admin'].includes(currentUserRole);
  const isModerator = ['moderator', 'admin'].includes(currentUserRole);

  // Regex to match [HIDEUSER=@username]content[/HIDEUSER]
  const hideUserRegex = /\[HIDEUSER=@([^\]]+)\]([\s\S]*?)\[\/HIDEUSER\]/gi;

  const result = content.replace(hideUserRegex, (match, targetUsername, hiddenContent) => {
    const currentId = parseInt(currentUserId);
    const authorId = parseInt(postAuthorId);
    const currentFirstName = currentUserFirstName?.toLowerCase();
    const targetFirstNameLower = targetUsername.toLowerCase();

    console.log('🔒 Hide content match found:', {
      match,
      targetUsername,
      currentFirstName,
      currentId,
      authorId,
      isAuthor: currentId === authorId,
      isTarget: currentFirstName === targetFirstNameLower,
      isContributor
    });

    // Escape the hidden content to prevent XSS, then linkify
    const escapedContent = linkifyText(escapeHtml(hiddenContent));

    // Moderator override: Show content with special indicator
    if (moderatorOverride && isModerator) {
      return `<div class="hide-content-visible" style="border-left: 4px solid #ef4444;">
        <div class="hide-content-header" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
          <span class="hide-content-icon">👁️</span>
          <span class="hide-content-label">MODERATOR VIEW - Private content for @${escapeHtml(targetUsername)}</span>
        </div>
        <div class="hide-content-body">${escapedContent}</div>
      </div>`;
    }

    // Show content if current user is the author or the target user (by firstname match)
    if (currentId === authorId || currentFirstName === targetFirstNameLower) {
      // Determine the label based on who is viewing
      let label;
      if (currentId === authorId && currentFirstName === targetFirstNameLower) {
        // User is both author and target (sent to themselves)
        label = 'Private Content (visible to you only)';
      } else if (currentId === authorId) {
        // User is the author
        label = `Private Content (visible to you and @${escapeHtml(targetUsername)})`;
      } else {
        // User is the target
        label = 'Private Content (visible to you and the author)';
      }
      
      return `<div class="hide-content-visible">
        <div class="hide-content-header">
          <span class="hide-content-icon">🔒</span>
          <span class="hide-content-label">${label}</span>
        </div>
        <div class="hide-content-body">${escapedContent}</div>
      </div>`;
    }

    // For non-contributors: show a simple indicator with light styling
    if (!isContributor) {
      return `<div style="
        background: #f3f4f6; 
        border-left: 3px solid #9ca3af; 
        padding: 12px 16px; 
        margin: 12px 0;
        border-radius: 4px;
        color: #6b7280; 
        font-style: italic;
        font-size: 14px;
      ">
        🔒 This content is private and not visible to you
      </div>`;
    }

    // For contributors who are not author/target: show hidden indicator with moderator button
    if (isModerator) {
      return `<div class="hide-content-hidden" style="position: relative;">
        <span class="hide-content-icon">🔒</span>
        <span class="hide-content-label">Hidden Content (private) - For @${escapeHtml(targetUsername)}</span>
      </div>`;
    }
    
    return `<div class="hide-content-hidden">
      <span class="hide-content-icon">🔒</span>
      <span class="hide-content-label">Hidden Content (private)</span>
    </div>`;
  });

  console.log('✅ parseHideContent result:', result.substring(0, 200));
  console.log('✅ Has HTML tags:', result.includes('<div'));
  
  // Linkify URLs in the final result
  return linkifyText(result);
};

/**
 * Check if content contains hide tags
 */
export const hasHideContent = (content) => {
  if (!content) return false;
  const hideUserRegex = /\[HIDEUSER=@[^\]]+\][\s\S]*?\[\/HIDEUSER\]/i;
  return hideUserRegex.test(content);
};

/**
 * Extract usernames from hide tags
 */
export const extractHideUsernames = (content) => {
  if (!content) return [];
  const hideUserRegex = /\[HIDEUSER=@([^\]]+)\]/gi;
  const matches = [...content.matchAll(hideUserRegex)];
  return matches.map(match => match[1]);
};

/**
 * Validate hide content syntax
 */
export const validateHideContentSyntax = (content) => {
  if (!content) return { valid: true, errors: [] };

  const errors = [];
  
  // Check for opening tags without closing tags
  const openTags = (content.match(/\[HIDEUSER=@[^\]]+\]/g) || []).length;
  const closeTags = (content.match(/\[\/HIDEUSER\]/g) || []).length;
  
  if (openTags !== closeTags) {
    errors.push('Mismatched [HIDEUSER] tags. Make sure each opening tag has a closing [/HIDEUSER] tag.');
  }

  // Check for missing @ symbol
  const invalidFormat = content.match(/\[HIDEUSER=[^@\]]/g);
  if (invalidFormat) {
    errors.push('Invalid format in [HIDEUSER] tag. Use [HIDEUSER=@username]content[/HIDEUSER]');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};
