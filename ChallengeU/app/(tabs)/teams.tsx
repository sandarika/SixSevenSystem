import React from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Trophy } from 'lucide-react-native';
import {
  removeJoinedTeamGamesFromAppleCalendar,
  syncJoinedTeamGamesToAppleCalendar,
} from '@/utils/apple-calendar-sync';
import { getLikedMeetupEvents, type LikedMeetupEvent } from '@/utils/meetup-calendar-sync';

export default function TeamsScreen() {
  const [sportFilter, setSportFilter] = React.useState('All');
  const [myTeams, setMyTeams] = React.useState<string[]>([]);
  const [isJoinExpanded, setIsJoinExpanded] = React.useState(true);
  const [selectedDay, setSelectedDay] = React.useState<number | null>(null);
  const [likedMeetupEvents, setLikedMeetupEvents] = React.useState<LikedMeetupEvent[]>([]);

  const intramuralTeams = [
    { id: 'bb-1', sport: 'Basketball', name: 'Scarlet Hoops' },
    { id: 'bb-2', sport: 'Basketball', name: 'Nebraska Ballers' },
    { id: 'sc-1', sport: 'Soccer', name: 'Union FC' },
    { id: 'vb-1', sport: 'Volleyball', name: 'Block Party' },
    { id: 'tn-1', sport: 'Tennis', name: 'Court Commanders' },
    { id: 'pb-1', sport: 'Pickleball', name: 'Dink Dynasty' },
  ];

  const teamGames: Record<string, { opponent: string; date: string; location: string; day: number }[]> = {
    'Scarlet Hoops': [
      { opponent: 'Nebraska Ballers', date: 'Mon 7:00 PM', location: 'Campus Rec Center', day: 2 },
      { opponent: 'Late Night Legends', date: 'Thu 8:15 PM', location: 'East Campus Rec Center', day: 5 },
    ],
    'Nebraska Ballers': [
      { opponent: 'Scarlet Hoops', date: 'Mon 7:00 PM', location: 'Campus Rec Center', day: 2 },
      { opponent: 'Union FC', date: 'Sat 4:30 PM', location: 'HSSV Courts', day: 7 },
    ],
    'Union FC': [
      { opponent: 'Field Kings', date: 'Tue 6:45 PM', location: 'Outdoor Adventure Center', day: 3 },
      { opponent: 'Nebraska Ballers', date: 'Sat 4:30 PM', location: 'HSSV Courts', day: 7 },
    ],
    'Block Party': [
      { opponent: 'Serve Aces', date: 'Wed 7:30 PM', location: 'Suite Courts', day: 4 },
      { opponent: 'Court Commanders', date: 'Sun 3:00 PM', location: 'Cather Courts', day: 8 },
    ],
    'Court Commanders': [
      { opponent: 'Racket Attack', date: 'Fri 5:30 PM', location: 'Cather Courts', day: 6 },
      { opponent: 'Block Party', date: 'Sun 3:00 PM', location: 'Cather Courts', day: 8 },
    ],
    'Dink Dynasty': [
      { opponent: 'Pickle Pros', date: 'Thu 6:00 PM', location: 'Suite Courts', day: 5 },
      { opponent: 'Net Ninjas', date: 'Sat 2:00 PM', location: 'HSSV Courts', day: 7 },
    ],
  };

  const visibleTeams = intramuralTeams.filter((team) => sportFilter === 'All' || team.sport === sportFilter);

  const upcomingGamesByTeam = myTeams.map((teamName) => ({
    teamName,
    sport: intramuralTeams.find((team) => team.name === teamName)?.sport ?? 'Unknown',
    games: teamGames[teamName] ?? [],
  }));

  const allJoinedGames = upcomingGamesByTeam.flatMap(({ teamName, sport, games }) =>
    games.map((game) => ({
      ...game,
      teamName,
      sport,
    }))
  );

  const meetupCalendarGames = likedMeetupEvents.map((event) => ({
    opponent: 'Open Meetup',
    date: event.time,
    location: event.location,
    day: event.day,
    teamName: 'Meetup',
    sport: event.sport,
  }));

  const allCalendarGames = [...allJoinedGames, ...meetupCalendarGames];

  const gameDays = new Set(allCalendarGames.map((game) => game.day));
  const selectedDayGames = selectedDay ? allCalendarGames.filter((game) => game.day === selectedDay) : [];

  const displayMonthDate = React.useMemo(() => {
    const marchDate = new Date();
    marchDate.setMonth(2);
    marchDate.setDate(1);
    return marchDate;
  }, []);

  const year = displayMonthDate.getFullYear();
  const monthIndex = displayMonthDate.getMonth();
  const monthName = displayMonthDate.toLocaleString('en-US', { month: 'long' });

  const syncAllJoinedTeamsToCalendar = React.useCallback(async () => {
    if (myTeams.length === 0) {
      return;
    }

    const results = await Promise.all(
      myTeams.map(async (teamName) => {
        const matchedTeam = intramuralTeams.find((team) => team.name === teamName);
        if (!matchedTeam) {
          return true;
        }

        const gamesForTeam = teamGames[teamName] ?? [];
        return syncJoinedTeamGamesToAppleCalendar(teamName, matchedTeam.sport, gamesForTeam);
      }),
    );

    if (results.some((synced) => !synced)) {
      Alert.alert(
        'Calendar Sync Failed',
        'Could not add one or more team games to Apple Calendar. Check iPhone Settings > ChallengeU > Calendars and verify the ChallengeU calendar is enabled in Apple Calendar.',
      );
    }
  }, [myTeams]);

  useFocusEffect(
    React.useCallback(() => {
      let isMounted = true;

      const loadLikedMeetupEvents = async () => {
        const events = await getLikedMeetupEvents();
        const currentMonthEvents = events.filter(
          (event) => event.month === monthIndex && event.year === year,
        );

        if (isMounted) {
          setLikedMeetupEvents(currentMonthEvents);
        }
      };

      loadLikedMeetupEvents();
      void syncAllJoinedTeamsToCalendar();

      return () => {
        isMounted = false;
      };
    }, [monthIndex, syncAllJoinedTeamsToCalendar, year]),
  );

  React.useEffect(() => {
    void syncAllJoinedTeamsToCalendar();
  }, [syncAllJoinedTeamsToCalendar]);

  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const weekdayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const totalCellsWithoutTrailing = firstWeekday + daysInMonth;
  const trailingEmptyCells = (7 - (totalCellsWithoutTrailing % 7)) % 7;
  const calendarCells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ...Array.from({ length: trailingEmptyCells }, () => null),
  ];

  const formatDayWithOrdinal = (day: number) => {
    const mod100 = day % 100;
    if (mod100 >= 11 && mod100 <= 13) {
      return `${day}th`;
    }

    switch (day % 10) {
      case 1:
        return `${day}st`;
      case 2:
        return `${day}nd`;
      case 3:
        return `${day}rd`;
      default:
        return `${day}th`;
    }
  };

  const handleJoinTeam = async (teamName: string) => {
    const alreadyJoined = myTeams.includes(teamName);
    if (alreadyJoined) {
      return;
    }

    const matchedTeam = intramuralTeams.find((team) => team.name === teamName);
    const gamesForTeam = teamGames[teamName] ?? [];

    setMyTeams((prevTeams) => {
      if (prevTeams.includes(teamName)) {
        return prevTeams;
      }
      return [...prevTeams, teamName];
    });

    if (matchedTeam) {
      const synced = await syncJoinedTeamGamesToAppleCalendar(teamName, matchedTeam.sport, gamesForTeam);
      if (!synced) {
        Alert.alert(
          'Calendar Sync Failed',
          'Could not add team games to Apple Calendar. Check iPhone Settings > ChallengeU > Calendars and verify the ChallengeU calendar is enabled in Apple Calendar.',
        );
      }
    }

    setIsJoinExpanded(false);
  };

  const handleLeaveTeam = (teamName: string) => {
    const gamesForTeam = teamGames[teamName] ?? [];
    setMyTeams((prevTeams) => prevTeams.filter((name) => name !== teamName));
    void removeJoinedTeamGamesFromAppleCalendar(teamName, gamesForTeam);
    setIsJoinExpanded(true);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#f4f3ef', dark: '#1D3D47' }}
      headerImage={<Trophy size={178} color="#e80e0e" style={styles.headerIcon} />}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Teams</ThemedText>
      </ThemedView>

      <ThemedView style={styles.sectionCard}>
        <ThemedText style={styles.sectionTitle} type="subtitle">Games Calendar</ThemedText>
        {myTeams.length > 0 || likedMeetupEvents.length > 0 ? (
          <>
            <ThemedView style={styles.calendarCard}>
              <ThemedText style={styles.calendarTitle}>{monthName} {year}</ThemedText>
              <ThemedView style={styles.weekdayRow}>
                {weekdayLabels.map((label, index) => (
                  <ThemedText key={`${label}-${index}`} style={styles.weekdayLabel}>{label}</ThemedText>
                ))}
              </ThemedView>

              <ThemedView style={styles.calendarGrid}>
                {calendarCells.map((day, index) => {
                  if (!day) {
                    return <ThemedView key={`empty-${index}`} style={styles.calendarCell} />;
                  }

                  const hasGames = gameDays.has(day);
                  const isSelected = selectedDay === day;

                  return (
                    <TouchableOpacity
                      key={`day-${day}`}
                      style={[
                        styles.calendarCell,
                        hasGames && styles.calendarCellWithGames,
                        isSelected && styles.calendarCellSelected,
                      ]}
                      onPress={() => setSelectedDay(day)}
                    >
                      <ThemedText style={[styles.calendarDayText, isSelected && styles.calendarDayTextSelected]}>
                        {day}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.dayDetailsCard}>
              <ThemedText style={styles.dayDetailsTitle}>Selected Day Details</ThemedText>
              {selectedDay ? (
                selectedDayGames.length > 0 ? (
                  selectedDayGames.map((game, idx) => (
                    <ThemedView key={`${game.teamName}-${game.opponent}-${idx}`} style={styles.gameCard}>
                      <ThemedText type="defaultSemiBold">Team: {game.teamName}</ThemedText>
                      <ThemedText style={styles.metaText}>vs {game.opponent}</ThemedText>
                      <ThemedText style={styles.metaText}>Sport: {game.sport}</ThemedText>
                      <ThemedText style={styles.metaText}>{game.date}</ThemedText>
                      <ThemedText style={styles.metaText}>{game.location}</ThemedText>
                    </ThemedView>
                  ))
                ) : (
                  <ThemedText style={styles.helperText}>No games on {monthName} {formatDayWithOrdinal(selectedDay)}.</ThemedText>
                )
              ) : (
                <ThemedText style={styles.helperText}>Tap a calendar day to view game details.</ThemedText>
              )}
            </ThemedView>

            <ThemedView style={styles.joinedTeamsCard}>
              <ThemedText style={styles.dayDetailsTitle}>Joined Teams</ThemedText>
              {myTeams.map((teamName) => (
                <ThemedView key={teamName} style={styles.joinedTeamRow}>
                  <ThemedText style={styles.helperText}>{teamName}</ThemedText>
                  <TouchableOpacity style={styles.teamActionButton} onPress={() => handleLeaveTeam(teamName)}>
                    <ThemedText style={styles.leaveActionText}>Leave</ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              ))}
            </ThemedView>
          </>
        ) : (
          <ThemedText style={styles.label}>Join a team or like a Meetup post to start filling your game calendar.</ThemedText>
        )}
      </ThemedView>

      <ThemedView style={styles.sectionCard}>
        <ThemedText style={styles.sectionTitle} type="subtitle">Join an Intramural Team</ThemedText>
        {myTeams.length > 0 && !isJoinExpanded ? (
          <ThemedView style={styles.collapsedJoinRow}>
            <ThemedText style={styles.helperText}>Joined teams: {myTeams.length}</ThemedText>
            <TouchableOpacity style={styles.changeButton} onPress={() => setIsJoinExpanded(true)}>
              <ThemedText style={styles.changeButtonText}>Add Team</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ) : (
          <>
            <ThemedText style={styles.label}>Pick a sport and join a team.</ThemedText>

            <ThemedText style={styles.label}>Sport</ThemedText>
            <Picker selectedValue={sportFilter} onValueChange={setSportFilter} style={styles.picker}>
              <Picker.Item label="All sports" value="All" />
              <Picker.Item label="Basketball" value="Basketball" />
              <Picker.Item label="Soccer" value="Soccer" />
              <Picker.Item label="Volleyball" value="Volleyball" />
              <Picker.Item label="Tennis" value="Tennis" />
              <Picker.Item label="Pickleball" value="Pickleball" />
            </Picker>

            {visibleTeams.map((team) => (
              <ThemedView key={team.id} style={styles.teamRow}>
                <ThemedView style={styles.teamName}>
                  <ThemedText type="defaultSemiBold">{team.name}</ThemedText>
                  <ThemedText style={styles.metaText}>{team.sport}</ThemedText>
                </ThemedView>
                <TouchableOpacity
                  style={[styles.joinButton, myTeams.includes(team.name) && styles.joinedButton]}
                  onPress={() => handleJoinTeam(team.name)}
                  disabled={myTeams.includes(team.name)}
                >
                  <ThemedText style={[styles.joinButtonText, myTeams.includes(team.name) && styles.joinedButtonText]}>
                    {myTeams.includes(team.name) ? 'Joined' : 'Join'}
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            ))}
          </>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  headerIcon: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  sectionCard: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#e80e0e',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 24,
    color: '#fff',
  },
  helperText: {
    color: '#333',
  },
  label: {
    fontWeight: '600',
    color: '#fff',
    marginTop: 4,
  },
  picker: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  metaText: {
    color: '#333',
    fontSize: 13,
  },
  teamName: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
    gap: 4,
  },
  teamHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#fff',
  },
  teamHeaderInfo: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#fff',
  },
  teamHeaderText: {
    color: '#333',
    flexShrink: 1,
  },
  teamHeaderActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 'auto',
    backgroundColor: '#fff',
  },
  teamActionButton: {
    backgroundColor: '#f4f3ef',
    borderWidth: 1,
    borderColor: '#e0dfd9',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  collapseToggleText: {
    color: '#e80e0e',
    fontWeight: '700',
  },
  leaveActionText: {
    color: '#333',
    fontWeight: '700',
  },
  calendarCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  calendarTitle: {
    color: '#333',
    fontWeight: '700',
    fontSize: 16,
  },
  weekdayRow: {
    flexDirection: 'row',
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    color: '#666',
    fontWeight: '600',
    fontSize: 12,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  calendarCell: {
    width: '13.5%',
    aspectRatio: 1,
    marginBottom: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0dfd9',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  calendarCellWithGames: {
    borderColor: '#e80e0e',
  },
  calendarCellSelected: {
    backgroundColor: '#e80e0e',
  },
  calendarDayText: {
    color: '#333',
    fontWeight: '600',
  },
  calendarDayTextSelected: {
    color: '#fff',
  },
  dayDetailsCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  dayDetailsTitle: {
    color: '#333',
    fontSize: 16,
    fontWeight: '700',
  },
  joinedTeamsCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  joinedTeamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  joinButton: {
    backgroundColor: '#e80e0e',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  joinedButton: {
    backgroundColor: '#f4f3ef',
    borderWidth: 1,
    borderColor: '#e0dfd9',
  },
  joinedButtonText: {
    color: '#333',
  },
  collapsedJoinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  changeButton: {
    backgroundColor: '#f4f3ef',
    borderWidth: 1,
    borderColor: '#e0dfd9',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  changeButtonText: {
    color: '#333',
    fontWeight: '700',
  },
  gameCard: {
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    gap: 2,
  },
});