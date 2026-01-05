#!/bin/bash
cd /home/kavia/workspace/code-generation/daily-journal-tracker-195272-195284/journal_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

