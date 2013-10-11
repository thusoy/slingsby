# Remember that the server is located in Ireland,
# so all times should be specified as UTC.

empty_vote_cache:
  cron.present:
    - name: curl -v localhost/tasks/empty_cache
    - minute: 0
    - hour: 23

count_new_votes:
  cron.present:
    - name: curl -v localhost/tasks/count_votes
    - hour: 23
    - minute: 1

update_archive:
  cron.present:
    - name: curl -v localhost/tasks/update_archive
    - hour: 23
    - minute: 10
