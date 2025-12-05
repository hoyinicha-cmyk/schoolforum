# Hide User Content Feature Guide

## Overview
The Hide User Content feature allows users to create private content that is only visible to themselves and one specific user. This is similar to PHC (PostHideContent) functionality.

## How It Works

### BBCode Format
```
[HIDEUSER=@username]Your private content here[/HIDEUSER]
```

### Visibility Rules
- **Post Author**: Can always see the hidden content
- **Target User** (specified by @username/firstname): Can see the hidden content
- **Everyone Else**: Sees a "Hidden Content (private)" placeholder

## Usage

### Creating Hidden Content

#### Method 1: Using the Helper (Recommended)
1. When creating a thread, click the "🔒 Add Hidden Content" button
2. Enter the first name of the person you want to share with (e.g., "John" or "@John")
3. Enter your private content
4. Click "Insert Hidden Content"
5. The BBCode tag will be inserted into your post

#### Method 2: Manual Entry
Simply type the BBCode format directly:
```
[HIDEUSER=@John]This is private content for John[/HIDEUSER]
```

### Finding Usernames
- Use the user's first name as shown in their profile
- The @ symbol is optional when typing (it will be added automatically)
- Username matching is case-insensitive

## Examples

### Example 1: Private Message in Post
```
Hey everyone! This is a public announcement.

[HIDEUSER=@John]Hey John, here's the private info you asked for: Meeting at 3pm[/HIDEUSER]

Thanks for reading!
```

### Example 2: Multiple Hidden Sections
```
Public content here.

[HIDEUSER=@Maria]Private note for Maria[/HIDEUSER]

More public content.

[HIDEUSER=@Alex]Different private note for Alex[/HIDEUSER]
```

## Visual Appearance

### For Authorized Users (Author or Target)
- Purple gradient background
- Lock icon 🔒
- Label: "Private Content (visible to you and @username)"
- Content displayed in white box

### For Unauthorized Users
- Gray gradient background
- Lock icon 🔒
- Label: "Hidden Content (private)"
- No content visible

## Technical Details

### Files Created
1. `frontend/src/utils/hideContentParser.js` - Parser logic
2. `frontend/src/components/Forum/HideContentStyles.css` - Styling
3. `frontend/src/components/Forum/HideContentHelper.js` - UI helper component

### Integration Points
- **ThreadDetail.js**: Parses and displays hidden content in posts and replies
- **CreateThreadModal.js**: Provides UI for inserting hidden content tags

### Functions Available

#### `parseHideContent(content, currentUserId, postAuthorId, currentUserFirstName)`
Parses content and replaces hide tags with appropriate HTML

#### `hasHideContent(content)`
Checks if content contains hide tags

#### `extractHideUsernames(content)`
Extracts all usernames from hide tags

#### `validateHideContentSyntax(content)`
Validates BBCode syntax

## Security Notes
- Usernames are matched on the frontend by first name
- Content is only hidden visually (not encrypted)
- Backend should implement additional access control if needed
- This is a UI-level feature for convenience, not security

## Limitations
- Username must match the user's first name exactly (case-insensitive)
- No nested hide tags supported
- Maximum content length follows post limits
- Only matches by first name (not full name or username)

## Future Enhancements
- Full name or email matching (not just first name)
- User picker/autocomplete with search
- Multiple users in one tag
- Backend validation and access control
- Notification to target user when mentioned
- Last name support for disambiguation

## Testing
1. Create a post with `[HIDEUSER=@YourFirstName]test content[/HIDEUSER]`
2. View as the author - should see content
3. View as another user - should see placeholder
4. View as the target user (with matching first name) - should see content

## Troubleshooting

### Content Not Hiding
- Check BBCode syntax is correct
- Ensure @ symbol is present before username
- Verify closing tag is present: `[/HIDEUSER]`

### Content Not Showing for Target User
- Verify the first name matches exactly (case doesn't matter)
- Check browser console for errors
- Ensure user is logged in
- Make sure the user's first name in their profile matches the tag

### Styling Issues
- Verify `HideContentStyles.css` is imported
- Check for CSS conflicts
- Clear browser cache

## Support
For issues or questions, check the browser console for error messages and verify the BBCode syntax is correct.
