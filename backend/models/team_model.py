from database.db_connection import execute_query


def create_team(event_id: int, team_name: str, team_lead_id: int) -> int:
    """Insert a new team and return its ID."""
    query = """
        INSERT INTO teams (event_id, team_name, team_lead_id)
        VALUES (%s, %s, %s)
    """
    return execute_query(query, (event_id, team_name, team_lead_id))


def add_team_member(team_id: int, student_id: int) -> int:
    """Add a student to a team. Returns member ID."""
    query = """
        INSERT INTO team_members (team_id, student_id)
        VALUES (%s, %s)
    """
    return execute_query(query, (team_id, student_id))


def check_team_duplicate(event_id: int, team_lead_id: int) -> bool:
    """Return True if a team already exists for this event led by this student."""
    query = """
        SELECT team_id FROM teams
        WHERE event_id = %s AND team_lead_id = %s
    """
    result = execute_query(query, (event_id, team_lead_id), fetch="one")
    return result is not None


def check_member_in_team(team_id: int, student_id: int) -> bool:
    """Return True if student is already in the team."""
    query = """
        SELECT team_member_id FROM team_members
        WHERE team_id = %s AND student_id = %s
    """
    result = execute_query(query, (team_id, student_id), fetch="one")
    return result is not None


def check_student_in_event_teams(event_id: int, student_id: int) -> bool:
    """Return True if student is already in a team for this event."""
    query = """
        SELECT tm.team_member_id FROM team_members tm
        JOIN teams t ON tm.team_id = t.team_id
        WHERE t.event_id = %s AND tm.student_id = %s
    """
    result = execute_query(query, (event_id, student_id), fetch="one")
    return result is not None


def get_team_by_id(team_id: int):
    """Fetch a team with its members."""
    team_query = """
        SELECT 
            t.team_id AS id,
            t.event_id AS eventId,
            t.team_name AS name,
            t.team_lead_id AS leadId,
            t.created_at AS createdAt,
            s.student_name AS leadName,
            s.student_email AS leadEmail
        FROM teams t
        JOIN students s ON t.team_lead_id = s.student_id
        WHERE t.team_id = %s
    """
    team = execute_query(team_query, (team_id,), fetch="one")
    if not team:
        return None

    members_query = """
        SELECT 
            s.student_id AS id,
            s.student_name AS name,
            s.student_email AS email,
            tm.joined_at AS joinedAt
        FROM team_members tm
        JOIN students s ON tm.student_id = s.student_id
        WHERE tm.team_id = %s
        ORDER BY tm.joined_at ASC
    """
    members = execute_query(members_query, (team_id,), fetch="all")
    
    team["members"] = members or []
    return team


def get_teams_for_event(event_id: int):
    """Fetch all teams for an event with their members."""
    teams_query = """
        SELECT 
            t.team_id AS id,
            t.event_id AS eventId,
            t.team_name AS name,
            t.team_lead_id AS leadId,
            t.created_at AS createdAt,
            s.student_name AS leadName,
            s.student_email AS leadEmail
        FROM teams t
        JOIN students s ON t.team_lead_id = s.student_id
        WHERE t.event_id = %s
        ORDER BY t.created_at DESC
    """
    teams = execute_query(teams_query, (event_id,), fetch="all")
    
    if not teams:
        return []

    for team in teams:
        members_query = """
            SELECT 
                s.student_id AS id,
                s.student_name AS name,
                s.student_email AS email,
                tm.joined_at AS joinedAt
            FROM team_members tm
            JOIN students s ON tm.student_id = s.student_id
            WHERE tm.team_id = %s
            ORDER BY tm.joined_at ASC
        """
        members = execute_query(members_query, (team["id"],), fetch="all")
        team["members"] = members or []

    return teams


def delete_team(team_id: int):
    """Delete a team and cascade delete members."""
    execute_query("DELETE FROM team_members WHERE team_id = %s", (team_id,))
    execute_query("DELETE FROM teams WHERE team_id = %s", (team_id,))
    return team_id
