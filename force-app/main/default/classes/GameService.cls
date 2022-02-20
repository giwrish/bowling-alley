public with sharing class GameService {
  @AuraEnabled
  public static Contact getExistingPlayer(String name) {
    try {
      List<Contact> playerList = [
        SELECT Id, LastName
        FROM Contact
        WHERE Name = :name
      ];

      if (playerList.isEmpty()) {
        return null;
      } else {
        return playerList.get(0);
      }
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  @AuraEnabled
  public static List<Bowling_Game__c> getPreviousScores() {
    try {
      return [
        SELECT Id, Name, Total_Score__c, Player__r.Name
        FROM Bowling_Game__c
        ORDER BY Name DESC
        LIMIT 10
      ];
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }
}
