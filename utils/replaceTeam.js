const TEAM_MEMBER_MAP = {
    'name in spreadsheet': 'ZOE email',
};

export const getTeamMemberName = (assignee) => {
    return TEAM_MEMBER_MAP[assignee] || null;
}