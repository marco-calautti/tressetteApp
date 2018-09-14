import { WaitingRoom } from './../_models/waitingRoom';
import { Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class HubService {
  private _hubConnection: signalR.HubConnection;

   waitingRoomsObservable = new BehaviorSubject<WaitingRoom[]>(null);
   playersObservable = new BehaviorSubject<string[]>(null);
   activeWaitingRoomObservable = new BehaviorSubject<WaitingRoom>(null);

  constructor(private _router: Router) {
    this._hubConnection = new signalR.HubConnectionBuilder().withUrl('/gamehub').build();
    this._hubConnection.start().then(() => {
      this._hubConnection.invoke('AllWaitingRoomsUpdate');
    });

    this._hubConnection.on('AllWaitingRoomsUpdate', (waitingRooms: WaitingRoom[]) => {
      this.waitingRoomsObservable.next(waitingRooms);
    });

    this._hubConnection.on('GetAllPlayers', (players: string[]) => {
      this.playersObservable.next(players);
    });

    this._hubConnection.on('SingleWaitingRoomUpdate', (waitingRoom: WaitingRoom) => {
      this.activeWaitingRoomObservable.next(waitingRoom);
    });
  }

  StopConnection() {
    this._hubConnection.stop();
  }

  CreateWaitingRoom() {
    this._hubConnection.invoke('CreateWaitingRoom').then(() => {
      this._router.navigateByUrl('waitingRoom');
    });
  }

  JoinWaitingRoom(id: string) {
    this._hubConnection.invoke('JoinWaitingRoom', id).then(() => {
      this._router.navigateByUrl('waitingRoom');
    });
  }

  LeaveWaitingRoom() {
    this._hubConnection.invoke('LeaveWaitingRoom', this.activeWaitingRoomObservable.getValue().id);
    this.activeWaitingRoomObservable.next(null);
    this._router.navigateByUrl('/');
  }

  get Players() {
    return this.playersObservable.asObservable();
  }
  get WaitingRooms() {
    return this.waitingRoomsObservable.asObservable();
  }
  get ActiveWaitingRoom() {
    return this.activeWaitingRoomObservable.asObservable();
  }
}